// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Fake {
	address public owner;

	constructor() {
		owner = msg.sender;
	}
}
