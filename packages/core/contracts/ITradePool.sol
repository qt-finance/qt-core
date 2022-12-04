// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {
	OwnableUpgradeable
} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {
	UUPSUpgradeable
} from '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import {
	ERC20Upgradeable
} from '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

abstract contract ITradePool {
	/**
	 * @notice Base token, only can deposit this token
	 */
	IERC20 public baseToken;

	/**
	 * @notice Pair token, the target token for trade
	 */
	IERC20 public tradeToken;

	struct PendingPool {
		// The total base token on pending pool
		uint256 total;
		// The joined accounts
		address[] accounts;
		// The asset of accounts
		mapping(address => uint256) accountAsset;
		// The maximum number of accounts on pending pool
		uint256 maxAccounts;
	}

	/**
	 * @notice Pending pool, the new base token that wait for next trade
	 */
	PendingPool public pendingPool;

	/**
	 * @notice Setup the maximum number of accounts on pending pool
	 * @param maxAccounts_ The maximum number of accounts on pending pool
	 */
	function setMaxAccountsOnPendingPool(uint256 maxAccounts_) external virtual;

	/**
	 * @notice Deposit base token into pending pool
	 * @param amount The number of base token
	 */
	function joinPendingPool(uint256 amount) external virtual;

	/**
	 * @notice Withdraw base token from pending pool
	 * @param amount The number of base token
	 */
	function leavePendingPool(uint256 amount) external virtual;

	/**
	 * @notice Get asset with account on pending pool
	 * @param account The asset's owner
	 * @return asset number
	 */
	function getAssetOnPendingPool(address account) external view virtual returns (uint256);

	/**
	 * @notice Get asset with account on pending pool
	 */
	function getAccountsOnPendingPool() external view virtual returns (address[] memory);
}
