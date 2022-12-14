import { ethers, upgrades, network } from 'hardhat';

import { setupQuantrollerPool } from '../../test/fixture';
import { getForkMainnetContract } from './common';

async function main() {
	const { quantroller, priceOracle } = await setupQuantrollerPool();

	const { usdcToken, wethToken } = await getForkMainnetContract();

	const TradePool = await ethers.getContractFactory('TradePool');
	const tradePool = await upgrades.deployProxy(
		TradePool,
		[
			quantroller.address,
			'qWETH-USDC',
			'WETH-USDC trade pool',
			usdcToken.address,
			6,
			wethToken.address,
		],
		{
			initializer: 'initialize',
			kind: 'uups',
		},
	);

	await tradePool.deployed();

	console.log(`TradePool contract deployed to ${tradePool.address}`);
	console.log(`Quantroller contract deployed to ${quantroller.address}`);
	console.log(`Simple PriceOracle contract deployed to ${priceOracle.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
