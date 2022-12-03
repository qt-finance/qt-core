import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

import { TestERC20, TradePool } from '../test-types';

describe('TradePool', () => {
	async function setupTradePoolFixture() {
		// Contracts are deployed using the first signer/account by default

		const [owner] = await ethers.getSigners();

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

		return { tradePool, owner, baseToken, tradeToken };
	}

	describe('# constructor', () => {
		it('setup the right owner', async () => {
			const { tradePool, owner } = await loadFixture(setupTradePoolFixture);

			expect(await tradePool.owner()).to.be.equal(owner.address);
		});

		it('setup the right name and symbol', async () => {
			const { tradePool } = await loadFixture(setupTradePoolFixture);

			expect(await tradePool.name()).to.be.equal('qTT-BT');
			expect(await tradePool.symbol()).to.be.equal('TT-BT trade pool');
		});

		it('setup the right token0 and token1', async () => {
			const { tradePool, baseToken, tradeToken } = await loadFixture(setupTradePoolFixture);

			expect(await tradePool.baseToken()).to.be.equal(baseToken.address);
			expect(await tradePool.tradeToken()).to.be.equal(tradeToken.address);
		});
	});
});
