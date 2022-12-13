// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ISwapRouter } from '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { IQuantroller } from './IQuantroller.sol';

abstract contract ITradePool {
	/**
	 * @notice QT Controller. Controller market/oracle
	 */
	IQuantroller public quantroller;

	/**
	 * @notice Trader's commission from user redeem. Default = 8%
	 */
	uint256 commissionRatioForTrader;

	/**
	 * @notice Owner's commission from user redeem. Default = 4%
	 */
	uint256 commissionRatioForOwner;

	/**
	 * @notice Base token, only can deposit this token
	 */
	IERC20 public baseToken;

	/**
	 * @notice Pair token, the target token for trade
	 */
	IERC20 public tradeToken;

	struct AccountData {
		// The asset of account
		uint256 asset;
		// The index of account in PendingPool accounts list
		uint256 index;
		// The latest round of account join
		uint256 round;
		// The value of account's shares
		uint256 valueIndex;
	}

	/**
	 * @notice The data of account
	 */
	mapping(address => AccountData) public accountData;

	struct PendingPool {
		// The current round on pending pool
		uint256 currentRound;
		// The total base token on pending pool
		uint256 total;
		// The joined accounts
		address[] accounts;
		// The maximum number of accounts on pending pool
		uint256 maxAccounts;
	}

	/**
	 * @notice Pending pool, the new base token that wait for next trade
	 */
	PendingPool public pendingPool;

	ISwapRouter public swapRouter;

	address public trader;

	/**
	 * @notice The pool value index => Total value = totalSupply() * valueIndex;
	 * Decimal 18
	 */
	uint256 public valueIndex;

	/**
	 * @notice The trade type: 0 => long, 1 => short
	 */
	enum TradeType {
		long,
		short
	}

	/**
	 * @notice Base token Decimal
	 */
	uint8 public baseTokenDecimal;

	/**
	 * @notice Indicator that this is a TradePool contract (for inspection)
	 */
	bool public constant isTradePool = true;

	/**
	 * @notice Setup the maximum number of accounts on pending pool
	 * @param maxAccounts_ The maximum number of accounts on pending pool
	 */
	function setMaxAccountsOnPendingPool(uint256 maxAccounts_) external virtual;

	/**
	 * @notice Setup the uniswap router
	 * @param swapRouter_ The swap router
	 */
	function setSwapRouter(ISwapRouter swapRouter_) external virtual;

	/**
	 * @notice Setup the trader who can openLong and openShort
	 * @param trader_ The trader
	 */
	function setTrader(address trader_) external virtual;

	/**
	 * TODO
	 */
	function setCommissionRatioForTrader(uint256 ratio_) external virtual;

	/**
	 * TODO
	 */
	function setCommissionRatioForOwner(uint256 ratio_) external virtual;

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
	 * @notice Get account list on pending pool
	 * @return account number
	 */
	function getAccountsOnPendingPool() external view virtual returns (address[] memory);

	/**
	 * @notice Redeem shares and withdraw asset with baseToken and tradeToken
	 * @param shares The number of shares token
	 * @return (The withdraw number of baseToken, The withdraw number of tradeToken)
	 */
	function redeem(uint256 shares) external virtual returns (uint256, uint256);

	/**
	 * @notice The open long method. Sell baseToken and buy tradeToken
	 * @param path The swap route path for uniswap
	 * @param amountIn The number of base token
	 * @param amountOutMinimum The minimum number of trade token
	 * @return amountOut The number of trade token that buy from swap
	 */
	function openLong(
		bytes calldata path,
		uint256 amountIn,
		uint256 amountOutMinimum
	) external virtual returns (uint256);

	/**
	 * @notice The open short method. Sell tradeToken and buy baseToken
	 * @param path The swap route path for uniswap
	 * @param amountIn The number of trade token
	 * @param amountOutMinimum The minimum number of base token
	 * @return amountOut The number of base token that buy from swap
	 */
	function openShort(
		bytes calldata path,
		uint256 amountIn,
		uint256 amountOutMinimum
	) external virtual returns (uint256);

	/**
	 * @notice The preview current valueIndex
	 * @return valueIndex The value of share token
	 */
	function previewValueIndex() public view virtual returns (uint256);
}
