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

contract Quantroller is Initializable, OwnableUpgradeable, UUPSUpgradeable, IQuantroller {
	function initialize() public initializer {
		__Ownable_init();
		__UUPSUpgradeable_init();

		__init();
	}

	function __init() internal initializer {}

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
