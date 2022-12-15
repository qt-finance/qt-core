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
import { ERC20 } from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

import { ITradePool } from './interface/ITradePool.sol';
import { IQuantroller } from './interface/IQuantroller.sol';

// import 'hardhat/console.sol';

contract TradePool is
	Initializable,
	OwnableUpgradeable,
	UUPSUpgradeable,
	ERC20Upgradeable,
	ITradePool
{
	function initialize(
		IQuantroller quantroller_,
		string memory name_,
		string memory symbol_,
		IERC20 baseToken_,
		uint8 baseTokenDecimal_,
		IERC20 tradeToken_
	) public initializer {
		__Ownable_init();
		__UUPSUpgradeable_init();
		__ERC20_init(name_, symbol_);

		__init(quantroller_, baseToken_, baseTokenDecimal_, tradeToken_);
	}

	function __init(
		IQuantroller quantroller_,
		IERC20 baseToken_,
		uint8 baseTokenDecimal_,
		IERC20 tradeToken_
	) internal initializer {
		quantroller = quantroller_;
		baseToken = baseToken_;
		baseTokenDecimal = baseTokenDecimal_;
		tradeToken = tradeToken_;

		commissionRatioForTrader = 8 * 1e16;
		commissionRatioForOwner = 4 * 1e16;
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
	function setCommissionRatioForTrader(uint256 ratio_) external override onlyOwner {
		commissionRatioForTrader = ratio_;
	}

	/// @inheritdoc ITradePool
	function setCommissionRatioForOwner(uint256 ratio_) external override onlyOwner {
		commissionRatioForOwner = ratio_;
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

		AccountData storage joinAccountData = accountData[joinAccount];

		// The account join the new round
		if (joinAccountData.round != pendingPool.currentRound) {
			// Initialize the current round on account data
			joinAccountData.index = pendingPool.accounts.length;
			joinAccountData.asset = 0;
			joinAccountData.round = pendingPool.currentRound;

			pendingPool.accounts.push(joinAccount);
		}

		pendingPool.total += amount;
		joinAccountData.asset += amount;
	}

	/// @inheritdoc ITradePool
	function leavePendingPool(uint256 amount) external override {
		require(amount > 0, 'Leave amount must > 0');

		address leaveAccount = _msgSender();
		AccountData storage leaveAccountData = accountData[leaveAccount];

		require(amount <= leaveAccountData.asset, 'Leave amount must <= Join amount');

		if (amount == leaveAccountData.asset) {
			address lastAccount = pendingPool.accounts[pendingPool.accounts.length - 1];

			// Remove leaveAccount on accounts list
			pendingPool.accounts[leaveAccountData.index] = lastAccount;
			pendingPool.accounts.pop();

			accountData[lastAccount].index = leaveAccountData.index;
			leaveAccountData.index = 0;
		}

		pendingPool.total -= amount;
		leaveAccountData.asset -= amount;

		baseToken.transfer(leaveAccount, amount);
	}

	/// @inheritdoc ITradePool
	function getAssetOnPendingPool(address account) external view override returns (uint256) {
		if (pendingPool.total == 0) {
			return 0;
		}

		AccountData memory accountData_ = accountData[account];

		return accountData_.round == pendingPool.currentRound ? accountData_.asset : 0;
	}

	/// @inheritdoc ITradePool
	function getAccountsOnPendingPool() external view override returns (address[] memory) {
		return pendingPool.accounts;
	}

	/// @inheritdoc ITradePool
	function previewValueIndex() public view override returns (uint256) {
		uint256 sharesBalance = totalSupply();

		if (sharesBalance == 0) {
			return 0;
		}

		PendingPool memory pendingPool_ = pendingPool;
		uint256 tradeBalance = tradeToken.balanceOf(address(this));
		uint256 baseBalance = baseToken.balanceOf(address(this));

		// 1e36, baseTokenPrice is the base => 1e18
		uint256 tradeValue = (quantroller.getPrice(address(tradeToken), address(baseToken)) *
			tradeBalance);

		return
			(tradeValue + _normalizeBaseTokenValue((baseBalance - pendingPool_.total) * 1e18)) /
			sharesBalance;
	}

	/// @inheritdoc ITradePool
	function redeem(uint256 shares) external override returns (uint256, uint256) {
		address redeemAccount = _msgSender();

		require(shares > 0, 'TradePool: Must > 0');
		require(shares <= balanceOf(redeemAccount), 'TradePool: Must < balance of sender');

		// Update ValueIndex
		_updateValueIndex();

		AccountData memory redeemAccountData = accountData[redeemAccount];

		uint256 sharesBalance = totalSupply();

		if (valueIndex > redeemAccountData.valueIndex) {
			// Commission = (valueIndex - redeemAccountData.valueIndex) * shares / valueIndex
			// commission For Trader = Commission * 8%
			// commission For Owner = Commission * 4%
			uint256 commission = ((valueIndex - redeemAccountData.valueIndex) * shares) /
				valueIndex;

			uint256 commissionForTrader = (commission * commissionRatioForTrader) / 1e18;
			uint256 commissionForOwner = (commission * commissionRatioForOwner) / 1e18;

			shares -= (commissionForTrader + commissionForOwner);

			_transfer(msg.sender, trader, commissionForTrader);
			_transfer(msg.sender, owner(), commissionForOwner);
		}

		_burn(redeemAccount, shares);

		uint256 withdrawBaseTokenBalance = (baseToken.balanceOf(address(this)) * shares) /
			sharesBalance;
		uint256 withdrawTradeTokenBalance = (tradeToken.balanceOf(address(this)) * shares) /
			sharesBalance;

		baseToken.transfer(redeemAccount, withdrawBaseTokenBalance);
		tradeToken.transfer(redeemAccount, withdrawTradeTokenBalance);

		return (withdrawBaseTokenBalance, withdrawTradeTokenBalance);
	}

	/// @inheritdoc ITradePool
	function openLong(
		bytes calldata path,
		uint256 amountIn,
		uint256 amountOutMinimum
	) external override onlyTrader returns (uint256) {
		uint256 baseBalance = baseToken.balanceOf(address(this));

		require(baseBalance >= amountIn, 'Must <= baseBalance');

		uint256 amountOut = _trade(path, address(baseToken), amountIn, amountOutMinimum);

		_rebalance(amountIn, amountOut, TradeType.long);

		return amountOut;
	}

	/// @inheritdoc ITradePool
	function openShort(
		bytes calldata path,
		uint256 amountIn,
		uint256 amountOutMinimum
	) external override onlyTrader returns (uint256) {
		uint256 tradeBalance = tradeToken.balanceOf(address(this));

		require(tradeBalance >= amountIn, 'Must >= tradeBalance');

		uint256 amountOut = _trade(path, address(tradeToken), amountIn, amountOutMinimum);

		_rebalance(amountOut, amountIn, TradeType.short);

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

	function _rebalance(
		uint256 baseAmount,
		uint256 tradeAmount,
		TradeType tradeType
	) internal returns (uint256) {
		PendingPool memory pendingPool_ = pendingPool;

		uint256 pendingPoolTotal = pendingPool_.total;

		uint256 tradeBalance = tradeToken.balanceOf(address(this));
		uint256 baseBalance = baseToken.balanceOf(address(this));

		uint256 currentTotalValue = _normalizeBaseTokenValue(
			(tradeBalance * baseAmount) / tradeAmount + baseBalance
		);
		uint256 expScale = 1e18;
		uint256 sharesBalance = totalSupply();

		// console.log(baseAmount, tradeAmount, currentTotalValue);

		if (pendingPoolTotal == 0) {
			// Just calculate valudeIndex
			valueIndex = (currentTotalValue * expScale) / sharesBalance;
			return 0;
		}

		// Get current balance;
		uint256 distributeShares = 0;

		// First distribute
		if (sharesBalance == 0) {
			// Initialize: Shares == Total number of baseToken
			distributeShares = currentTotalValue;
		} else {
			// For long, buy tradeToken, sell baseToken
			// For short, buy baseToken, sell tradeToken
			uint256 oldTradeBalance = tradeType == TradeType.long
				? tradeBalance - tradeAmount
				: tradeBalance + tradeAmount;
			uint256 oldBaseBalance = tradeType == TradeType.long
				? baseBalance + baseAmount
				: baseBalance - baseAmount;

			// Calculate old total value
			uint256 oldTotalValue = _normalizeBaseTokenValue(
				(oldTradeBalance * baseAmount) / tradeAmount + oldBaseBalance - pendingPoolTotal
			);

			require(
				currentTotalValue > oldTotalValue,
				'TradePool: Must more value to distribute LP'
			);

			distributeShares = (sharesBalance * currentTotalValue) / oldTotalValue - sharesBalance;
		}

		valueIndex = (currentTotalValue * expScale) / (distributeShares + sharesBalance);

		uint256 countDistributeShares = 0;

		// 0.3% for fee
		uint256 feeDistributeShares = (distributeShares * 3) / 1000;
		distributeShares -= feeDistributeShares;

		// distribute shares
		for (uint256 i = 0; i < pendingPool_.accounts.length; i++) {
			address account = pendingPool_.accounts[i];
			AccountData memory accountData_ = accountData[account];

			uint256 accountDistributeShares = (distributeShares * accountData_.asset) /
				pendingPoolTotal;

			if (i == pendingPool_.accounts.length - 1) {
				// Prevent loose shares
				accountDistributeShares = distributeShares - countDistributeShares;
			} else {
				countDistributeShares += accountDistributeShares;
			}

			_mint(account, accountDistributeShares);
		}

		_mint(owner(), feeDistributeShares);

		// Reset pending pool
		pendingPool.total = 0;
		delete pendingPool.accounts;

		return 0;
	}

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 amount
	) internal override {
		// Ignore Burn
		if (to == address(0)) {
			return;
		}

		AccountData storage toAccountData = accountData[to];

		uint256 toValueIndex = toAccountData.valueIndex;
		uint256 toBalance = balanceOf(to);

		// Come from _mint => The newest valueIndex
		// Come from user => accountData[from].valueIndex
		uint256 fromValueIndex = from == address(0) ? valueIndex : accountData[from].valueIndex;

		// Average account value index
		toAccountData.valueIndex =
			(fromValueIndex * amount + toValueIndex * toBalance) /
			(amount + toBalance);
	}

	function _normalizeValue(uint256 tokenValue, uint256 decimal) internal pure returns (uint256) {
		if (decimal < 18) {
			return tokenValue * 10**(18 - decimal);
		}

		if (decimal > 18) {
			return tokenValue / 10**(decimal - 18);
		}

		return tokenValue;
	}

	function _normalizeBaseTokenValue(uint256 tokenValue) internal view returns (uint256) {
		return _normalizeValue(tokenValue, baseTokenDecimal);
	}

	function _updateValueIndex() internal {
		valueIndex = previewValueIndex();
	}
}
