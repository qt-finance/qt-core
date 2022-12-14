import { ethers, upgrades, network } from 'hardhat';

import { getForkMainnetContract } from '../scripts/fork/common';
import { BinanceWallet } from '../scripts/fork/config';
import { Quantroller, SimplePriceOracle, TestERC20, TradePool } from '../test-types';

export async function setupQuantrollerPool() {
	const PriceOracleContract = await ethers.getContractFactory('SimplePriceOracle');

	const priceOracle = (await PriceOracleContract.deploy()) as SimplePriceOracle;

	const QuantrollerContract = await ethers.getContractFactory('Quantroller');
	const quantroller = (await upgrades.deployProxy(QuantrollerContract, [priceOracle.address], {
		initializer: 'initialize',
		kind: 'uups',
	})) as Quantroller;

	return { quantroller, priceOracle };
}

export async function setupTradePool() {
	const [owner, ...otherAccount] = await ethers.getSigners();

	const { quantroller, priceOracle } = await setupQuantrollerPool();

	const TestERC20Contract = await ethers.getContractFactory('TestERC20');

	const baseToken = (await TestERC20Contract.deploy('BaseToken', 'BT')) as TestERC20;
	const tradeToken = (await TestERC20Contract.deploy('TradeToken', 'TT')) as TestERC20;

	const TradePoolContract = await ethers.getContractFactory('TradePool');
	const tradePool = (await upgrades.deployProxy(
		TradePoolContract,
		[quantroller.address, 'qTT-BT', 'TT-BT trade pool', baseToken.address, 18, tradeToken.address],
		{
			initializer: 'initialize',
			kind: 'uups',
		},
	)) as TradePool;

	return { tradePool, owner, otherAccount, baseToken, tradeToken, quantroller, priceOracle };
}

export const USDC_DECIMAL = 10n ** 6n;

const UniSwapRouter = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

export async function setupTradePoolOnForkMainnet() {
	await network.provider.request({
		method: 'hardhat_reset',
		params: [
			{
				forking: {
					jsonRpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_FORK_API_KEY}`,
					blockNumber: 15815693,
				},
			},
		],
	});

	await network.provider.request({
		method: 'hardhat_impersonateAccount',
		params: [BinanceWallet],
	});
	const user1 = await ethers.getSigner(BinanceWallet);

	const [owner, trader, ...otherAccount] = await ethers.getSigners();

	const { quantroller, priceOracle } = await setupQuantrollerPool();

	const { usdcToken, wethToken } = await getForkMainnetContract();

	const USDCDecimal = await usdcToken.decimals();

	const TradePoolContract = await ethers.getContractFactory('TradePool');
	const tradePool = (await upgrades.deployProxy(
		TradePoolContract,
		[
			quantroller.address,
			'qWETH-USDC',
			'WETH-USDC trade pool',
			usdcToken.address,
			USDCDecimal,
			wethToken.address,
		],
		{
			initializer: 'initialize',
			kind: 'uups',
		},
	)) as TradePool;

	await tradePool.setMaxAccountsOnPendingPool(10);
	await tradePool.setSwapRouter(UniSwapRouter);
	await tradePool.setTrader(trader.address);

	return {
		tradePool,
		owner,
		trader,
		user1,
		otherAccount,
		usdcToken,
		wethToken,
		quantroller,
		priceOracle,
	};
}
