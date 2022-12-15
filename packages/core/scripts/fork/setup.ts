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

const UniSwapRouter = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

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

	const [owner, trader, user, ...otherAccount] = await ethers.getSigners();

	await tradePool.setMaxAccountsOnPendingPool(10);
	await quantroller.addMarket(tradePool.address);
	await simplePriceOracle.setPrice(wethToken.address, usdcToken.address, 1347274425519823367182n);
	await tradePool.setSwapRouter(UniSwapRouter);
	await tradePool.setTrader(trader.address);

	await network.provider.request({
		method: 'hardhat_impersonateAccount',
		params: [BinanceWallet],
	});
	const binanceBoss = await ethers.getSigner(BinanceWallet);

	// await owner.sendTransaction({
	// 	to: binanceBoss.address,
	// 	value: ethers.utils.parseEther('50.0'), // Sends exactly 1.0 ether
	// });

	await usdcToken.connect(binanceBoss).transfer(user.address, 10000n * 10n ** 6n);

	const balanceUSDC = await usdcToken.balanceOf(user.address);

	console.log('Owner Balance', balanceUSDC);

	console.log('Setup the account');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
