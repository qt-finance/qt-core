// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { ERC20 } from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

contract TestERC20 is ERC20, Ownable {
	constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

	function mint(address to, uint256 amount) external onlyOwner {
		_mint(to, amount);
	}
}
