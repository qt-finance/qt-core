// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { IPriceOracle } from '../interface/IPriceOracle.sol';

contract SimplePriceOracle is IPriceOracle {
	mapping(address => uint256) prices;

	/// @inheritdoc IPriceOracle
	function getPrice(IERC20 token) external view override returns (uint256) {
		return prices[address(token)];
	}

	function setPrice(address token, uint256 price) public {
		prices[token] = price;
	}
}
