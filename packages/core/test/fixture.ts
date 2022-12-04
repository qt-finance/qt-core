import { ethers, upgrades, network } from 'hardhat';

import { ERC20, TestERC20, TradePool } from '../test-types';

export async function setupTradePool() {
	const [owner, ...otherAccount] = await ethers.getSigners();

	const TestERC20Contract = await ethers.getContractFactory('TestERC20');

	const baseToken = (await TestERC20Contract.deploy('BaseToken', 'BT')) as TestERC20;
	const tradeToken = (await TestERC20Contract.deploy('TradeToken', 'TT')) as TestERC20;

	const TradePoolContract = await ethers.getContractFactory('TradePool');
	const tradePool = (await upgrades.deployProxy(
		TradePoolContract,
		['qTT-BT', 'TT-BT trade pool', baseToken.address, tradeToken.address],
		{
			initializer: 'initialize',
			kind: 'uups',
		},
	)) as TradePool;

	return { tradePool, owner, otherAccount, baseToken, tradeToken };
}

export const USDC_DECIMAL = 10n ** 6n;

const BinanceWallet = '0xF977814e90dA44bFA03b6295A0616a897441aceC';
export const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const WETHAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const UniSwapRouter = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

export async function setupTradePoolOnForkMainnet() {
	await network.provider.request({
		method: 'hardhat_impersonateAccount',
		params: [BinanceWallet],
	});
	const user1 = await ethers.getSigner(BinanceWallet);

	const [owner, trader, ...otherAccount] = await ethers.getSigners();

	const usdcToken = (await ethers.getContractAt('ERC20', USDCAddress)) as ERC20;
	const wethToken = (await ethers.getContractAt('ERC20', WETHAddress)) as ERC20;

	const TradePoolContract = await ethers.getContractFactory('TradePool');
	const tradePool = (await upgrades.deployProxy(
		TradePoolContract,
		['qWETH-USDC', 'WETH-USDC trade pool', usdcToken.address, wethToken.address],
		{
			initializer: 'initialize',
			kind: 'uups',
		},
	)) as TradePool;

	await tradePool.setMaxAccountsOnPendingPool(10);
	await tradePool.setSwapRouter(UniSwapRouter);
	await tradePool.setTrader(trader.address);

	return { tradePool, owner, trader, user1, otherAccount, usdcToken, wethToken };
}
