import { ethers } from 'hardhat';

import { ERC20 } from '../../test-types';
import { USDCAddress, WETHAddress } from './config';

export const getForkMainnetContract = async () => {
	const usdcToken = (await ethers.getContractAt('ERC20', USDCAddress)) as ERC20;
	const wethToken = (await ethers.getContractAt('ERC20', WETHAddress)) as ERC20;

	return { usdcToken, wethToken };
};
