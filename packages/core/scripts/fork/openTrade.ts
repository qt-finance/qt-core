import { ethers, network } from 'hardhat';
import { BigNumber } from 'ethers';

import { Quantroller, SimplePriceOracle, TradePool } from '../../test-types';
import { getForkMainnetContract } from './common';
import {
	BinanceWallet,
	quantrollerAddress,
	simplePriceOracleAddress,
	tradePoolAddress,
	USDCAddress,
	WETHAddress,
} from './config';

const USDC_DECIMAL = 10n ** 6n;

async function main() {
	const { usdcToken, wethToken } = await getForkMainnetContract();

	const [owner, trader, ...otherAccount] = await ethers.getSigners();

	const tradePool = (await ethers.getContractAt('TradePool', tradePoolAddress)) as TradePool;
	const quantroller = (await ethers.getContractAt(
		'Quantroller',
		quantrollerAddress,
	)) as Quantroller;
	const simplePriceOracle = (await ethers.getContractAt(
		'SimplePriceOracle',
		simplePriceOracleAddress,
	)) as SimplePriceOracle;

	// await simplePriceOracle.setPrice(wethToken.address, usdcToken.address, 1347274425519823367182n);

	const pathType = ['address', 'uint24', 'address'];
	const path = [USDCAddress, 500, WETHAddress];

	const sellAmount = 5000n * USDC_DECIMAL;
	const amounOutMinimum = 3711196401632008557n;

	const currentETHValue = BigNumber.from(sellAmount)
		.mul(10n ** 12n)
		.mul(10n ** 18n)
		.div(amounOutMinimum);
	// console.log('check', currentETHValue);
	// 1347274425519823367182

	await tradePool
		.connect(trader)
		.openLong(ethers.utils.solidityPack(pathType, path), sellAmount, amounOutMinimum);

	const increaseETHValue = currentETHValue.mul(11).div(10);

	const valueIndex = await tradePool.valueIndex();

	// console.log('old valueIndex', valueIndex);

	// await simplePriceOracle.setPrice(wethToken.address, usdcToken.address, increaseETHValue);

	console.log('Setup the openTrade', valueIndex);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
