// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IPriceOracle } from './IPriceOracle.sol';

abstract contract IQuantroller {
	/**
	 * @notice Oracle which gives the price of any given token
	 */
	IPriceOracle public oracle;

	struct Market {
		// Whether or not this market is listed
		bool isListed;
	}

	/**
	 * @notice Official mapping of trade pool => Market metadata
	 */
	mapping(address => Market) public markets;

	/**
	 * @notice Get the token price
	 * @param tokenIn The contract address of either tokenIn or tokenOut
	 * @param tokenOut The contract address of the other token
	 * @return price The tokenIn price (scaled by 1e18).
	 *  Zero means the price is unavailable.
	 */

	function getPrice(address tokenIn, address tokenOut)
		external
		view
		virtual
		returns (uint256 price);
}
