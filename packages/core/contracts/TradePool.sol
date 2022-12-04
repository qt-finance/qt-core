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

import { TransferHelper } from '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import { ISwapRouter } from '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
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

	modifier onlyTrader() {
		require(trader == _msgSender(), 'TradePool: caller is not the trader');
		_;
	}

	/// @inheritdoc ITradePool
	function setMaxAccountsOnPendingPool(uint256 maxAccounts_) external override onlyOwner {
		pendingPool.maxAccounts = maxAccounts_;
	}

	/// @inheritdoc ITradePool
	function setSwapRouter(ISwapRouter swapRouter_) external override onlyOwner {
		swapRouter = swapRouter_;
	}

	/// @inheritdoc ITradePool
	function setTrader(address trader_) external override onlyOwner {
		trader = trader_;
	}

	/// @inheritdoc ITradePool
	function joinPendingPool(uint256 amount) external override {
		require(amount > 0, 'Join amount must > 0');
		require(pendingPool.accounts.length < pendingPool.maxAccounts, 'Reached maximum accounts');

		address joinAccount = _msgSender();

		// Transfer base token from joinAccount
		baseToken.transferFrom(joinAccount, address(this), amount);

		// The new round
		if (pendingPool.total == 0) {
			pendingPool.currentRound++;
		}

		AccountData storage accountData = pendingPool.accountData[joinAccount];

		// The account join the new round
		if (accountData.round != pendingPool.currentRound) {
			// Initialize the current round on account data
			accountData.index = pendingPool.accounts.length;
			accountData.asset = 0;
			accountData.round = pendingPool.currentRound;

			pendingPool.accounts.push(joinAccount);
		}

		pendingPool.total += amount;
		accountData.asset += amount;
	}

	/// @inheritdoc ITradePool
	function leavePendingPool(uint256 amount) external override {
		require(amount > 0, 'Leave amount must > 0');

		address leaveAccount = _msgSender();
		AccountData storage accountData = pendingPool.accountData[leaveAccount];

		require(amount <= accountData.asset, 'Leave amount must <= Join amount');

		if (amount == accountData.asset) {
			address lastAccount = pendingPool.accounts[pendingPool.accounts.length - 1];

			// Remove leaveAccount on accounts list
			pendingPool.accounts[accountData.index] = lastAccount;
			pendingPool.accounts.pop();

			pendingPool.accountData[lastAccount].index = accountData.index;
			accountData.index = 0;
		}

		pendingPool.total -= amount;
		accountData.asset -= amount;

		baseToken.transfer(leaveAccount, amount);
	}

	/// @inheritdoc ITradePool
	function getAssetOnPendingPool(address account) external view override returns (uint256) {
		AccountData memory accountData = pendingPool.accountData[account];

		if (pendingPool.total == 0) {
			return 0;
		}

		return accountData.round == pendingPool.currentRound ? accountData.asset : 0;
	}

	/// @inheritdoc ITradePool
	function getAccountsOnPendingPool() external view override returns (address[] memory) {
		return pendingPool.accounts;
	}

	function openLong(
		bytes calldata path,
		uint256 amountIn,
		uint256 amountOutMinimum
	) external override onlyTrader returns (uint256) {
		uint256 baseBalance = baseToken.balanceOf(address(this));

		require(baseBalance >= amountIn, 'Must <= baseBalance');

		uint256 amountOut = _trade(path, address(baseToken), amountIn, amountOutMinimum);

		// Reset pending pool
		pendingPool.total = 0;
		delete pendingPool.accounts;

		return amountOut;
	}

	function openShort(
		bytes calldata path,
		uint256 amountIn,
		uint256 amountOutMinimum
	) external override onlyTrader returns (uint256) {
		uint256 tradeBalance = tradeToken.balanceOf(address(this));

		require(tradeBalance >= amountIn, 'Must >= tradeBalance');

		uint256 amountOut = _trade(path, address(tradeToken), amountIn, amountOutMinimum);

		return amountOut;
	}

	function _trade(
		bytes calldata path,
		address amountInToken,
		uint256 amountIn,
		uint256 amountOutMinimum
	) internal returns (uint256) {
		TransferHelper.safeApprove(address(amountInToken), address(swapRouter), amountIn);

		ISwapRouter.ExactInputParams memory uniSwapparams = ISwapRouter.ExactInputParams({
			path: path,
			recipient: address(this),
			deadline: block.timestamp,
			amountIn: amountIn,
			amountOutMinimum: amountOutMinimum
		});

		uint256 amountOut = swapRouter.exactInput(uniSwapparams);

		return amountOut;
	}
}
