// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IUniswapV3Pool } from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import { IUniswapV3Factory } from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import { FixedPoint96 } from '@uniswap/v3-core/contracts/libraries/FixedPoint96.sol';
import { Math } from '@openzeppelin/contracts/utils/math/Math.sol';
import { ERC20 } from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { TickMath } from './uniswap/TickMath.sol';
import { IPriceOracle } from './interface/IPriceOracle.sol';

contract PriceOracle is IPriceOracle, Ownable {
	mapping(address => mapping(address => address)) public Pool;

	function getSqrtTwapX96(address uniswapV3Pool, uint32 twapInterval)
		public
		view
		returns (uint160 sqrtPriceX96)
	{
		if (twapInterval == 0) {
			// return the current price if twapInterval == 0
			(sqrtPriceX96, , , , , , ) = IUniswapV3Pool(uniswapV3Pool).slot0();
		} else {
			uint32[] memory secondsAgos = new uint32[](2);
			secondsAgos[0] = twapInterval; // from (before)
			secondsAgos[1] = 0; // to (now)

			(int56[] memory tickCumulatives, ) = IUniswapV3Pool(uniswapV3Pool).observe(secondsAgos);

			// tick(imprecise as it's an integer) to price
			sqrtPriceX96 = TickMath.getSqrtRatioAtTick(
				int24(int32(tickCumulatives[1] - tickCumulatives[0]) / int32(twapInterval))
			);
		}
	}

	function addPool(
		address tokenIn,
		address tokenOut,
		address _pool
	) external onlyOwner {
		Pool[tokenIn][tokenOut] = _pool;
		Pool[tokenOut][tokenIn] = _pool;
	}

	function sqrtPriceX96ToUint(uint160 sqrtPriceX96, uint8 decimalsToken0)
		internal
		pure
		returns (uint256)
	{
		uint256 numerator1 = uint256(sqrtPriceX96) * uint256(sqrtPriceX96);
		uint256 numerator2 = 10**decimalsToken0;
		return Math.mulDiv(numerator1, numerator2, 1 << 192);
	}

	/// @inheritdoc IPriceOracle
	function getPrice(address tokenIn, address tokenOut)
		external
		view
		override
		returns (uint256 price)
	{
		IUniswapV3Pool pool = IUniswapV3Pool(Pool[tokenIn][tokenOut]);

		if (tokenIn == pool.token0()) {
			price = sqrtPriceX96ToUint(
				getSqrtTwapX96(address(pool), 100),
				ERC20(tokenIn).decimals()
			);
			return price * 10**(18 - ERC20(tokenOut).decimals());
		}

		price = sqrtPriceX96ToUint(getSqrtTwapX96(address(pool), 100), ERC20(tokenOut).decimals());

		// For calculate token1 price from token0
		// https://stackoverflow.com/a/74619134
		return 10**(18 + ERC20(tokenIn).decimals()) / price;
	}
}
