import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

import { setupTradePoolOnForkMainnet, USDCAddress, USDC_DECIMAL, WETHAddress } from './fixture';

describe('TradePool Advenced method', () => {
	describe('# constructor', () => {
		it('setup the right owner', async () => {
			const { tradePool, owner } = await loadFixture(setupTradePoolOnForkMainnet);

			expect(await tradePool.owner()).to.be.equal(owner.address);
		});

		it('setup the right token0 and token1', async () => {
			const { tradePool, wethToken, usdcToken } = await loadFixture(setupTradePoolOnForkMainnet);

			expect(await tradePool.baseToken()).to.be.equal(usdcToken.address);
			expect(await tradePool.tradeToken()).to.be.equal(wethToken.address);
		});
	});

	describe('Trade', () => {
		async function setupTradeFixture() {
			// Contracts are deployed using the first signer/account by default

			const TradePool = await setupTradePoolOnForkMainnet();

			const { tradePool, owner, trader, user1, usdcToken, wethToken } = TradePool;

			const joinAmount = 10000n * USDC_DECIMAL;

			await usdcToken.connect(user1).approve(tradePool.address, joinAmount);

			await tradePool.connect(user1).joinPendingPool(joinAmount);

			return { ...TradePool, joinAmount };
		}

		it('should open long by trader', async () => {
			const { tradePool, trader, usdcToken, user1 } = await loadFixture(setupTradeFixture);

			const pathType = ['address', 'uint24', 'address'];
			const path = [USDCAddress, 500, WETHAddress];

			const sellAmount = 5000n * USDC_DECIMAL;

			await expect(
				tradePool
					.connect(trader)
					.openLong(ethers.utils.solidityPack(pathType, path), sellAmount, 0),
			).to.changeTokenBalances(usdcToken, [tradePool], [-sellAmount]);

			// Check clear pending pool
			const pendingPool = await tradePool.pendingPool();
			const user1Asset = await tradePool.getAssetOnPendingPool(user1.address);
			const accounts = await tradePool.getAccountsOnPendingPool();

			expect(pendingPool.total).to.be.equal(0);
			expect(user1Asset).to.be.equal(0);
			expect(accounts).to.not.include(user1.address);
		});
	});
});
