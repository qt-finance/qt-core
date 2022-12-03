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

contract TradePool is Initializable, OwnableUpgradeable, UUPSUpgradeable, ERC20Upgradeable {
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

	/**
	 * @notice Setup the maximum number of accounts on pending pool
	 * @param maxAccounts_ The maximum number of accounts on pending pool
	 */
	function setMaxAccountsOnPendingPool(uint256 maxAccounts_) external onlyOwner {
		pendingPool.maxAccounts = maxAccounts_;
	}

	/**
	 * @notice Deposit base token into pending pool
	 * @param amount The number of base token
	 */
	function joinPendingPool(uint256 amount) external {
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

	/**
	 * @notice Withdraw base token from pending pool
	 * @param amount The number of base token
	 */
	function leavePendingPool(uint256 amount) external {
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

	function getAssetOnPendingPool(address account) external view returns (uint256) {
		return pendingPool.accountAsset[account];
	}

	function getAccountsOnPendingPool() external view returns (address[] memory) {
		return pendingPool.accounts;
	}
}
