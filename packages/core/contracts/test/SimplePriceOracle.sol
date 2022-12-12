// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { IPriceOracle } from '../interface/IPriceOracle.sol';

contract SimplePriceOracle is IPriceOracle {
	mapping(address => mapping(address => uint256)) prices;

	/// @inheritdoc IPriceOracle
	function getPrice(address tokenIn, address tokenOut) external view override returns (uint256) {
		return prices[tokenIn][tokenOut];
	}

	function setPrice(
		address tokenIn,
		address tokenOut,
		uint256 price
	) public {
		prices[tokenIn][tokenOut] = price;
		prices[tokenOut][tokenIn] = price;
	}
}
