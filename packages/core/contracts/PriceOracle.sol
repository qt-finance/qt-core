// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IUniswapV3Pool } from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import { IUniswapV3Factory } from '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import { FixedPoint96 } from '@uniswap/v3-core/contracts/libraries/FixedPoint96.sol';
import { Math } from '@openzeppelin/contracts/utils/math/Math.sol';
import { ERC20 } from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

// import '@uniswap/v3-core/contracts/libraries/TickMath.sol';

import { TickMath } from './uniswap/TickMath.sol';
import { IPriceOracle } from './interface/IPriceOracle.sol';

contract PriceOracle is IPriceOracle {
	function getSqrtTwapX96(
		address uniswapV3Pool,
		uint32 twapInterval
	) public view returns (uint160 sqrtPriceX96) {
		// address uniswapV3Pool= 0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36;
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

	function getPriceX96FromSqrtPriceX96(
		uint160 sqrtPriceX96
	) public pure returns (uint256 priceX96) {
		return Math.mulDiv(sqrtPriceX96, sqrtPriceX96, FixedPoint96.Q96);
	}

	/// @inheritdoc IPriceOracle
	function getPrice(
		address tokenIn,
		address tokenOut
	) external view override returns (uint256 price) {
		uint24 fee = 5;
		IUniswapV3Pool pool = IUniswapV3Pool(
			IUniswapV3Factory(0x1F98431c8aD98523631AE4a59f267346ea31F984).getPool(
				tokenIn,
				tokenOut,
				fee
			)
		);
		(uint160 sqrtPriceX96, , , , , , ) = pool.slot0(); //(1e18)
		return (uint(sqrtPriceX96) * (uint(sqrtPriceX96)) * (10**ERC20(tokenIn).decimals)) >> (96 * 2);
	}
}
