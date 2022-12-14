import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

import { PriceOracle } from '../../test-types';
// import { BigNumber } from 'ethers';

describe('Oracle', () => {
	async function setupOracleFixture() {
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

		const [owner, ...otherAccount] = await ethers.getSigners();

		const Oracle = await ethers.getContractFactory('PriceOracle');
		const PriceOracle = (await Oracle.deploy()) as PriceOracle;

		return { owner, otherAccount, PriceOracle };
	}

	it('get price with token0', async () => {
		const { PriceOracle, owner } = await loadFixture(setupOracleFixture);
		await PriceOracle.addPool(
			'0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
			'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
			'0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36', // WETH-USDT
		);

		// Get WETH price with token0
		const price = await PriceOracle.getPrice(
			'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
			'0xdAC17F958D2ee523a2206206994597C13D831ec7',
		);

		expect(price).to.be.equal(1345394325000000000000n);
	});

	it('get price with token1', async () => {
		const { PriceOracle, owner } = await loadFixture(setupOracleFixture);
		await PriceOracle.addPool(
			'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
			'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
			'0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640', // USDC-WETH
		);

		// Get WETH price with token1
		const price = await PriceOracle.getPrice(
			'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
			'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		);

		// console.log(BigNumber.from(10n ** 36n).div(price));

		expect(price).to.be.equal(1346605664799211844135n);
	});
});
