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
		await PriceOracle.addPool(
			'0xdAC17F958D2ee523a2206206994597C13D831ec7',
			'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
			'0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36',
		);
		const price = await PriceOracle.getPrice(
			'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
			'0xdAC17F958D2ee523a2206206994597C13D831ec7',
		);

		expect(price).to.be.gt(134539432500000000000n);
	});
});
