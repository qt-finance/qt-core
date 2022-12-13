import { ethers, upgrades, network } from 'hardhat';

import { setupQuantrollerPool } from '../test/fixture';
import { ERC20 } from '../test-types';

const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WETHAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const BinanceWallet = '0xF977814e90dA44bFA03b6295A0616a897441aceC';

async function main() {
	const { quantroller, priceOracle } = await setupQuantrollerPool();

	const usdcToken = (await ethers.getContractAt('ERC20', USDCAddress)) as ERC20;
	const wethToken = (await ethers.getContractAt('ERC20', WETHAddress)) as ERC20;

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

	usdcToken.connect(binanceBoss).transfer(owner.address, 10000n * 10n ** 6n);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
