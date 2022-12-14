import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { BigNumber } from 'ethers';

import { setupTradePoolOnForkMainnet, USDC_DECIMAL } from '../fixture';
import { USDCAddress, WETHAddress } from '../../scripts/fork/config';

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

	describe('Trade with Shares calculation', () => {
		async function setupTradeWithSingleUserFixture() {
			const TradePool = await setupTradePoolOnForkMainnet();

			const { tradePool, user1, usdcToken, trader } = TradePool;

			const user1JoinAmount = 10000n * USDC_DECIMAL;

			await usdcToken.connect(user1).approve(tradePool.address, user1JoinAmount);

			await tradePool.connect(user1).joinPendingPool(user1JoinAmount);

			const pathType = ['address', 'uint24', 'address'];
			const path = [USDCAddress, 500, WETHAddress];

			const sellAmount = 5000n * USDC_DECIMAL;
			const amounOutMinimum = 3711196401632008557n;

			await tradePool
				.connect(trader)
				.openLong(ethers.utils.solidityPack(pathType, path), sellAmount, amounOutMinimum);

			return { ...TradePool, user1JoinAmount };
		}

		async function setupTradeWithMultiUserFixture() {
			const TradePool = await setupTradePoolOnForkMainnet();

			const { tradePool, owner, user1, usdcToken, trader } = TradePool;

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
			const amounOutMinimum = 3711196401632008557n;

			await tradePool
				.connect(trader)
				.openLong(ethers.utils.solidityPack(pathType, path), sellAmount, amounOutMinimum);

			return { ...TradePool, user1JoinAmount, ownerJoinAmount };
		}

		it('should get the correct Shares and setup valueIndex with single user', async () => {
			const { tradePool, owner, user1 } = await loadFixture(setupTradeWithSingleUserFixture);

			const sharesBalance = await tradePool.totalSupply();
			const feeBalance = sharesBalance.mul(3).div(1000);

			expect(await tradePool.balanceOf(user1.address)).to.be.equal(sharesBalance.sub(feeBalance));
			expect(await tradePool.balanceOf(owner.address)).to.be.equal(feeBalance);
			expect(await tradePool.valueIndex()).to.be.equal(10n ** 18n);
		});

		it('should redeem the Shares for withdraw assets with single user', async () => {
			const { tradePool, user1, usdcToken, wethToken } = await loadFixture(
				setupTradeWithSingleUserFixture,
			);

			const usdcBalance = await usdcToken.balanceOf(tradePool.address);
			const wethBalance = await wethToken.balanceOf(tradePool.address);
			const sharesBalance = await tradePool.totalSupply();
			const feeBalance = sharesBalance.mul(3).div(1000);
			const user1SharesBalance = sharesBalance.sub(feeBalance);

			const withdrawWETHBalance = wethBalance.mul(user1SharesBalance).div(sharesBalance);
			const withdrawUSDCBalance = usdcBalance.mul(user1SharesBalance).div(sharesBalance);

			await expect(tradePool.connect(user1).redeem(user1SharesBalance))
				.to.changeTokenBalances(
					wethToken,
					[tradePool, user1],
					[-withdrawWETHBalance, withdrawWETHBalance],
				)
				.to.changeTokenBalances(
					usdcToken,
					[tradePool, user1],
					[-withdrawUSDCBalance, withdrawUSDCBalance],
				);
		});

		it('should get the correct Shares and setup valueIndex with multi user', async () => {
			const { tradePool, owner, user1, ownerJoinAmount, user1JoinAmount } = await loadFixture(
				setupTradeWithMultiUserFixture,
			);

			const sharesBalance = await tradePool.totalSupply();
			const feeBalance = sharesBalance.mul(3).div(1000);

			expect(await tradePool.balanceOf(user1.address)).to.be.equal(
				sharesBalance
					.sub(feeBalance)
					.mul(user1JoinAmount)
					.div(ownerJoinAmount + user1JoinAmount),
			);

			expect(await tradePool.balanceOf(owner.address)).to.be.equal(
				feeBalance.add(
					sharesBalance
						.sub(feeBalance)
						.mul(ownerJoinAmount)
						.div(ownerJoinAmount + user1JoinAmount),
				),
			);
			expect(await tradePool.valueIndex()).to.be.equal(10n ** 18n);
		});

		it('should redeem the Shares for withdraw assets with multi user', async () => {
			const { tradePool, user1, usdcToken, wethToken } = await loadFixture(
				setupTradeWithMultiUserFixture,
			);

			const usdcBalance = await usdcToken.balanceOf(tradePool.address);
			const wethBalance = await wethToken.balanceOf(tradePool.address);
			const sharesBalance = await tradePool.totalSupply();
			const user1SharesBalance = await tradePool.balanceOf(user1.address);

			const withdrawWETHBalance = wethBalance.mul(user1SharesBalance).div(sharesBalance);
			const withdrawUSDCBalance = usdcBalance.mul(user1SharesBalance).div(sharesBalance);

			await expect(tradePool.connect(user1).redeem(user1SharesBalance))
				.to.changeTokenBalances(
					wethToken,
					[tradePool, user1],
					[-withdrawWETHBalance, withdrawWETHBalance],
				)
				.to.changeTokenBalances(
					usdcToken,
					[tradePool, user1],
					[-withdrawUSDCBalance, withdrawUSDCBalance],
				);
		});
	});

	describe('Redeem with oracle', () => {
		async function setupTradeWithSingleUserFixture() {
			const TradePool = await setupTradePoolOnForkMainnet();

			const { tradePool, user1, usdcToken, trader } = TradePool;

			const user1JoinAmount = 10000n * USDC_DECIMAL;

			await usdcToken.connect(user1).approve(tradePool.address, user1JoinAmount);

			await tradePool.connect(user1).joinPendingPool(user1JoinAmount);

			const pathType = ['address', 'uint24', 'address'];
			const path = [USDCAddress, 500, WETHAddress];

			const sellAmount = 5000n * USDC_DECIMAL;
			const amounOutMinimum = 3711196401632008557n;

			const currentETHValue = BigNumber.from(sellAmount)
				.mul(10n ** 12n)
				.mul(10n ** 18n)
				.div(amounOutMinimum);
			// console.log('check', currentETHValue);
			// 1347274425519823367182

			await tradePool
				.connect(trader)
				.openLong(ethers.utils.solidityPack(pathType, path), sellAmount, amounOutMinimum);

			return { ...TradePool, user1JoinAmount, currentETHValue };
		}

		it('should charge the shares with redeem if valueIndex up', async () => {
			const {
				tradePool,
				user1,
				owner,
				trader,
				usdcToken,
				wethToken,
				priceOracle,
				currentETHValue,
			} = await loadFixture(setupTradeWithSingleUserFixture);

			const usdcBalance = await usdcToken.balanceOf(tradePool.address);
			const wethBalance = await wethToken.balanceOf(tradePool.address);
			const sharesBalance = await tradePool.totalSupply();
			const user1SharesBalance = await tradePool.balanceOf(user1.address);

			// console.log(usdcBalance);
			// console.log(wethBalance);
			// console.log(sharesBalance);

			// up 10%
			const increaseETHValue = currentETHValue.mul(11).div(10);

			const valueIndex = await tradePool.valueIndex();

			// console.log('old valueIndex', valueIndex);

			await priceOracle.setPrice(wethToken.address, usdcToken.address, increaseETHValue);

			const withdrawWETHBalance = wethBalance.mul(user1SharesBalance).div(sharesBalance);
			const withdrawUSDCBalance = usdcBalance.mul(user1SharesBalance).div(sharesBalance);

			const newValueIndex = await tradePool.previewValueIndex();

			// console.log('new valueIndex', newValueIndex);

			const comissionWETH = newValueIndex
				.sub(valueIndex)
				.mul(withdrawWETHBalance)
				.div(newValueIndex)
				.mul(12)
				.div(100);

			const comissionUSDC = newValueIndex
				.sub(valueIndex)
				.mul(withdrawUSDCBalance)
				.div(newValueIndex)
				.mul(12)
				.div(100);

			const comissionShares = newValueIndex
				.sub(valueIndex)
				.mul(user1SharesBalance)
				.div(newValueIndex);

			// console.log(withdrawWETHBalance, comissionWETH);
			// console.log(withdrawUSDCBalance, comissionUSDC);

			await expect(tradePool.connect(user1).redeem(user1SharesBalance))
				.to.changeTokenBalances(
					wethToken,
					[tradePool, user1],
					[
						-withdrawWETHBalance.sub(comissionWETH).sub(1),
						withdrawWETHBalance.sub(comissionWETH).sub(1),
					],
				)
				.to.changeTokenBalances(
					usdcToken,
					[tradePool, user1],
					[
						-withdrawUSDCBalance.sub(comissionUSDC).sub(1),
						withdrawUSDCBalance.sub(comissionUSDC).sub(1),
					],
				)
				.to.changeTokenBalances(
					tradePool,
					[trader, owner, user1],
					[
						comissionShares.mul(8).div(100),
						comissionShares.mul(4).div(100),
						user1SharesBalance.mul(-1).toString(),
					],
				);
		});
	});
});
