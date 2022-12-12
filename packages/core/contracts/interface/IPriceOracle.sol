// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

abstract contract IPriceOracle {
	bool public constant isPriceOracle = true;

	/**
	 * @notice Get the token price
	 * @param token The token to get the price of
	 * @return The token price (scaled by 1e18).
	 *  Zero means the price is unavailable.
	 */
	
	function getPrice(address tokenIn, address tokenOut) external view virtual returns (uint256 price);

}
