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

import { ITradePool } from './ITradePool.sol';

contract TradePool is
	Initializable,
	OwnableUpgradeable,
	UUPSUpgradeable,
	ERC20Upgradeable,
	ITradePool
{
	function initialize(
		string memory name_,
		string memory symbol_,
		IERC20 baseToken_,
		IERC20 tradeToken_
	) public initializer {
		__Ownable_init();
		__UUPSUpgradeable_init();
		__ERC20_init(name_, symbol_);

		__init(baseToken_, tradeToken_);
	}

	function __init(IERC20 baseToken_, IERC20 tradeToken_) internal initializer {
		baseToken = baseToken_;
		tradeToken = tradeToken_;
	}

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	/// @inheritdoc ITradePool
	function setMaxAccountsOnPendingPool(uint256 maxAccounts_) external override onlyOwner {
		pendingPool.maxAccounts = maxAccounts_;
	}

	/// @inheritdoc ITradePool
	function joinPendingPool(uint256 amount) external override {
		require(amount > 0, 'Join amount must > 0');
		require(pendingPool.accounts.length < pendingPool.maxAccounts, 'Reached maximum accounts');

		address joinAccount = _msgSender();

		baseToken.transferFrom(joinAccount, address(this), amount);

		if (pendingPool.accountAsset[joinAccount] == 0) {
			pendingPool.accounts.push(joinAccount);
		}

		pendingPool.total += amount;
		pendingPool.accountAsset[joinAccount] += amount;
	}

	/// @inheritdoc ITradePool
	function leavePendingPool(uint256 amount) external override {
		require(amount > 0, 'Leave amount must > 0');

		address leaveAccount = _msgSender();

		require(
			amount <= pendingPool.accountAsset[leaveAccount],
			'Leave amount must <= Join amount'
		);

		if (amount == pendingPool.accountAsset[leaveAccount]) {
			uint256 len = pendingPool.accounts.length;
			uint256 accountIndex = len;

			for (uint256 i = 0; i < len; i++) {
				if (pendingPool.accounts[i] == leaveAccount) {
					accountIndex = i;
					break;
				}
			}

			require(accountIndex < len, 'Must joined pending pool');

			pendingPool.accounts[accountIndex] = pendingPool.accounts[len - 1];
			pendingPool.accounts.pop();
		}

		baseToken.transfer(leaveAccount, amount);

		pendingPool.total -= amount;
		pendingPool.accountAsset[leaveAccount] -= amount;
	}

	/// @inheritdoc ITradePool
	function getAssetOnPendingPool(address account) external view override returns (uint256) {
		return pendingPool.accountAsset[account];
	}

	/// @inheritdoc ITradePool
	function getAccountsOnPendingPool() external view override returns (address[] memory) {
		return pendingPool.accounts;
	}
}
