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
}
