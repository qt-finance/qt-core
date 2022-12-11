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
}
