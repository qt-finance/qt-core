import { expect } from 'chai';
import { ethers, network } from 'hardhat';
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

			const { tradePool, user1, usdcToken } = TradePool;

			const joinAmount = 10000n * USDC_DECIMAL;

			await usdcToken.connect(user1).approve(tradePool.address, joinAmount);

			await tradePool.connect(user1).joinPendingPool(joinAmount);

			return { ...TradePool, joinAmount };
		}

		it('should open long by trader', async () => {
			const { tradePool, trader, usdcToken, wethToken, user1 } = await loadFixture(
				setupTradeFixture,
			);

			const pathType = ['address', 'uint24', 'address'];
			const path = [USDCAddress, 500, WETHAddress];

			const sellAmount = 5000n * USDC_DECIMAL;
			const amounOutMinimum = 3711196401632008557n;

			await expect(
				tradePool
					.connect(trader)
					.openLong(ethers.utils.solidityPack(pathType, path), sellAmount, amounOutMinimum),
			)
				.to.changeTokenBalances(usdcToken, [tradePool], [-sellAmount])
				.to.changeTokenBalances(wethToken, [tradePool], [amounOutMinimum]);

			// Check clear pending pool
			const pendingPool = await tradePool.pendingPool();
			const user1Asset = await tradePool.getAssetOnPendingPool(user1.address);
			const accounts = await tradePool.getAccountsOnPendingPool();

			expect(pendingPool.total).to.be.equal(0);
			expect(user1Asset).to.be.equal(0);
			expect(accounts).to.not.include(user1.address);
		});

		it('should open short by trader', async () => {
			const { tradePool, trader, usdcToken, wethToken } = await loadFixture(setupTradeFixture);

			const pathType = ['address', 'uint24', 'address'];
			const path = [USDCAddress, 500, WETHAddress];

			const sellAmount = 5000n * USDC_DECIMAL;
			const amounOutMinimum = 3711196401632008557n;

			await tradePool
				.connect(trader)
				.openLong(ethers.utils.solidityPack(pathType, path), sellAmount, amounOutMinimum);

			const shortAmount = amounOutMinimum / 2n;
			const shortAmounOutMinimum = 2497505973n;

			await expect(
				tradePool
					.connect(trader)
					.openShort(
						ethers.utils.solidityPack(pathType, path.reverse()),
						shortAmount,
						shortAmounOutMinimum,
					),
			)
				.to.changeTokenBalances(wethToken, [tradePool], [-shortAmount])
				.to.changeTokenBalances(usdcToken, [tradePool], [shortAmounOutMinimum]);
		});
	});

	describe('Trade with LP calculation', () => {
		async function setupTradeWithSingleUserFixture() {
			// Contracts are deployed using the first signer/account by default

			const TradePool = await setupTradePoolOnForkMainnet();

			const { tradePool, owner, user1, usdcToken, wethToken, trader } = TradePool;

			const user1JoinAmount = 10000n * USDC_DECIMAL;

			await usdcToken.connect(user1).approve(tradePool.address, user1JoinAmount);

			await tradePool.connect(user1).joinPendingPool(user1JoinAmount);

			const pathType = ['address', 'uint24', 'address'];
			const path = [USDCAddress, 500, WETHAddress];

			const sellAmount = 5000n * USDC_DECIMAL;
			const amounOutMinimum = 3711180507490324827n;

			await tradePool
				.connect(trader)
				.openLong(ethers.utils.solidityPack(pathType, path), sellAmount, amounOutMinimum);

			// const wethBalance = await wethToken.balanceOf(tradePool.address);

			// console.log(wethBalance);

			return { ...TradePool, user1JoinAmount };
		}

		async function setupTradeWithMultiUserFixture() {
			// Contracts are deployed using the first signer/account by default

			const TradePool = await setupTradePoolOnForkMainnet();

			const { tradePool, owner, user1, usdcToken, wethToken, trader } = TradePool;

			const user1JoinAmount = 10000n * USDC_DECIMAL;
			const ownerJoinAmount = 5000n * USDC_DECIMAL;

			// Transfer for owner
			await usdcToken.connect(user1).transfer(owner.address, ownerJoinAmount);

			await usdcToken.connect(owner).approve(tradePool.address, ownerJoinAmount);
			await usdcToken.connect(user1).approve(tradePool.address, user1JoinAmount);

			await tradePool.connect(owner).joinPendingPool(ownerJoinAmount);
			await tradePool.connect(user1).joinPendingPool(user1JoinAmount);

			const pathType = ['address', 'uint24', 'address'];
			const path = [USDCAddress, 500, WETHAddress];

			const sellAmount = 5000n * USDC_DECIMAL;
			const amounOutMinimum = 3711148735331249393n;

			await tradePool
				.connect(trader)
				.openLong(ethers.utils.solidityPack(pathType, path), sellAmount, amounOutMinimum);

			// const wethBalance = await wethToken.balanceOf(tradePool.address);

			// console.log(wethBalance);

			return { ...TradePool, user1JoinAmount, ownerJoinAmount };
		}

		it('should get the correct LP and setup valueIndex with single user', async () => {
			const { tradePool, owner, user1 } = await loadFixture(setupTradeWithSingleUserFixture);

			const lpBalance = await tradePool.totalSupply();
			const feeBalance = lpBalance.mul(3).div(1000);

			expect(await tradePool.balanceOf(user1.address)).to.be.equal(lpBalance.sub(feeBalance));
			expect(await tradePool.balanceOf(owner.address)).to.be.equal(feeBalance);
		});

		it('should get the correct LP and setup valueIndex with multi user', async () => {
			const { tradePool, owner, user1, ownerJoinAmount, user1JoinAmount } = await loadFixture(
				setupTradeWithMultiUserFixture,
			);

			const lpBalance = await tradePool.totalSupply();
			const feeBalance = lpBalance.mul(3).div(1000);

			expect(await tradePool.balanceOf(user1.address)).to.be.equal(
				lpBalance
					.sub(feeBalance)
					.mul(user1JoinAmount)
					.div(ownerJoinAmount + user1JoinAmount),
			);

			expect(await tradePool.balanceOf(owner.address)).to.be.equal(
				feeBalance.add(
					lpBalance
						.sub(feeBalance)
						.mul(ownerJoinAmount)
						.div(ownerJoinAmount + user1JoinAmount),
				),
			);
		});
	});
});
