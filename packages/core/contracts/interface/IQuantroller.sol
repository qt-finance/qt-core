// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IPriceOracle } from './IPriceOracle.sol';

abstract contract IQuantroller {
	/**
	 * @notice Oracle which gives the price of any given token
	 */
	IPriceOracle public oracle;
}
