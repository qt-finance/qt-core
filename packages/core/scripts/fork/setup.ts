import { ethers, network } from 'hardhat';

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

async function main() {
	const { usdcToken, wethToken } = await getForkMainnetContract();

	const tradePool = (await ethers.getContractAt('TradePool', tradePoolAddress)) as TradePool;
	const quantroller = (await ethers.getContractAt(
		'Quantroller',
		quantrollerAddress,
	)) as Quantroller;
	const simplePriceOracle = (await ethers.getContractAt(
		'SimplePriceOracle',
		simplePriceOracleAddress,
	)) as SimplePriceOracle;

	await network.provider.request({
		method: 'hardhat_impersonateAccount',
		params: [BinanceWallet],
	});
	const binanceBoss = await ethers.getSigner(BinanceWallet);

	const [owner, trader, ...otherAccount] = await ethers.getSigners();

	await owner.sendTransaction({
		to: binanceBoss.address,
		value: ethers.utils.parseEther('50.0'), // Sends exactly 1.0 ether
	});

	await usdcToken.connect(binanceBoss).transfer(owner.address, 10000n * 10n ** 6n);

	console.log('Setup the account');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
