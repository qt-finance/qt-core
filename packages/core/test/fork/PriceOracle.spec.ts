import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

import { PriceOracle } from '../../test-types';

describe('Oracle', () => {
	async function setupOracleFixture() {
		const [owner, ...otherAccount] = await ethers.getSigners();

		const Oracle = await ethers.getContractFactory('PriceOracle');
		const PriceOracle = (await Oracle.deploy()) as PriceOracle;

		return { owner, otherAccount, PriceOracle };
	}

	it('get price', async () => {
		const { PriceOracle, owner } = await loadFixture(setupOracleFixture);

		const price = await PriceOracle.getSqrtTwapX96(
			'0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36',
			100,
		);

		const priceX96 = await PriceOracle.getPriceX96FromSqrtPriceX96(price);

		expect(price).to.be.equal(2906058680596429297100009n);
		console.log('get oracle', Math.sqrt(1343.83) * 2 ** 96);

		expect(priceX96).to.be.equal(106593120262626048148n);
		console.log('get oracle', 1343.83 * 2 ** 96);
	});
});
