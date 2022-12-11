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
}
