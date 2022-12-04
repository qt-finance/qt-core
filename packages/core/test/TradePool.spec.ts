import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

import { setupTradePool } from './fixture';

describe('TradePool Basic method', () => {
	describe('# constructor', () => {
		it('setup the right owner', async () => {
			const { tradePool, owner } = await loadFixture(setupTradePool);

			expect(await tradePool.owner()).to.be.equal(owner.address);
		});

		it('setup the right name and symbol', async () => {
			const { tradePool } = await loadFixture(setupTradePool);

			expect(await tradePool.name()).to.be.equal('qTT-BT');
			expect(await tradePool.symbol()).to.be.equal('TT-BT trade pool');
		});

		it('setup the right token0 and token1', async () => {
			const { tradePool, baseToken, tradeToken } = await loadFixture(setupTradePool);

			expect(await tradePool.baseToken()).to.be.equal(baseToken.address);
			expect(await tradePool.tradeToken()).to.be.equal(tradeToken.address);
		});
	});

	describe('Pending Pool', () => {
		async function setupPendingPoolFixture() {
			// Contracts are deployed using the first signer/account by default

			const TradePool = await setupTradePool();

			const { tradePool, owner, otherAccount, baseToken } = TradePool;

			const userB = otherAccount[0];

			await baseToken.mint(owner.address, 100);
			await baseToken.mint(userB.address, 100);

			await baseToken.approve(tradePool.address, 100);
			await baseToken.connect(userB).approve(tradePool.address, 100);

			return { ...TradePool, userB };
		}

		it('setup maximum accounts', async () => {
			const { tradePool } = await loadFixture(setupPendingPoolFixture);

			await tradePool.setMaxAccountsOnPendingPool(10);

			const pendingPool = await tradePool.pendingPool();

			expect(pendingPool.maxAccounts).to.be.equal(10);
		});

		it('join pending pool with baseToken', async () => {
			const { tradePool, owner, userB, baseToken } = await loadFixture(setupPendingPoolFixture);

			await tradePool.setMaxAccountsOnPendingPool(10);

			await tradePool.connect(userB).joinPendingPool(50);

			await expect(tradePool.joinPendingPool(100)).to.changeTokenBalances(
				baseToken,
				[owner, tradePool],
				[-100, 100],
			);

			const pendingPool = await tradePool.pendingPool();

			const ownerAsset = await tradePool.getAssetOnPendingPool(owner.address);

			expect(pendingPool.total).to.be.equal(150);
			expect(ownerAsset).to.be.equal(100);
		});

		it('leave pending pool with baseToken', async () => {
			const { tradePool, owner, userB, baseToken } = await loadFixture(setupPendingPoolFixture);

			await tradePool.setMaxAccountsOnPendingPool(10);

			await tradePool.joinPendingPool(100);
			await tradePool.connect(userB).joinPendingPool(50);

			await expect(tradePool.leavePendingPool(100)).to.changeTokenBalances(
				baseToken,
				[owner, tradePool],
				[100, -100],
			);

			const pendingPool = await tradePool.pendingPool();

			const ownerAsset = await tradePool.getAssetOnPendingPool(owner.address);
			const accounts = await tradePool.getAccountsOnPendingPool();

			expect(pendingPool.total).to.be.equal(50);
			expect(ownerAsset).to.be.equal(0);
			expect(accounts).to.include(userB.address);
			expect(accounts).to.not.include(owner.address);
		});
	});
});
