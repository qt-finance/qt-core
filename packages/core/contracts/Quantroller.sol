// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {
	OwnableUpgradeable
} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {
	UUPSUpgradeable
} from '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';

import { IQuantroller } from './interface/IQuantroller.sol';
import { IPriceOracle } from './interface/IPriceOracle.sol';
import { ITradePool } from './interface/ITradePool.sol';

contract Quantroller is Initializable, OwnableUpgradeable, UUPSUpgradeable, IQuantroller {
	function initialize(IPriceOracle oracle_) public initializer {
		__Ownable_init();
		__UUPSUpgradeable_init();

		__init(oracle_);
	}

	function __init(IPriceOracle oracle_) internal initializer {
		oracle = oracle_;
	}

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	function setPriceOracle(IPriceOracle oracle_) public onlyOwner {
		oracle = oracle_;
	}

	function addMarket(ITradePool tradePool) external onlyOwner {
		require(tradePool.isTradePool(), 'Must be a TradePool');

		Market storage market = markets[address(tradePool)];
		market.isListed = true;
	}

	function removeMarket(ITradePool tradePool) external onlyOwner {
		require(tradePool.isTradePool(), 'Must be a TradePool');

		Market storage market = markets[address(tradePool)];
		market.isListed = false;
	}

	function getPrice(address tokenIn, address tokenOut)
		external
		view
		override
		returns (uint256 price)
	{
		return oracle.getPrice(tokenIn, tokenOut);
	}
}
