import { ethers, upgrades } from 'hardhat';

import { ERC20 } from '../test-types';

const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WETHAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

async function main() {
	const usdcToken = (await ethers.getContractAt('ERC20', USDCAddress)) as ERC20;
	const wethToken = (await ethers.getContractAt('ERC20', WETHAddress)) as ERC20;

	const TradePool = await ethers.getContractFactory('TradePool');
	const tradePool = await upgrades.deployProxy(
		TradePool,
		['qWETH-USDC', 'WETH-USDC trade pool', usdcToken.address, 18, wethToken.address],
		{
			initializer: 'initialize',
			kind: 'uups',
		},
	);

	await tradePool.deployed();

	console.log(`contract deployed to ${tradePool.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
