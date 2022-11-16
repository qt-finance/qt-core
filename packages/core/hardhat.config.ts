import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const config: HardhatUserConfig = {
	solidity: {
		version: '0.8.17',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
			evmVersion: 'berlin',
			// for smock to mock contracts
			outputSelection: {
				'*': {
					'*': ['storageLayout'],
				},
			},
		},
	},
	networks: {
		goerli: {
			url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
			accounts:
				typeof process.env.GOERLI_PRIVATE_KEY !== 'undefined'
					? [process.env.GOERLI_PRIVATE_KEY as string]
					: [],
		},
		hardhat: {
			chainId: 1,
			blockGasLimit: 1_500_000_000,
			forking: {
				url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_FORK_API_KEY}`,
				blockNumber: 15815693,
				enabled: process.env.HARDHAT_FORK_TEST ? true : false,
			},
			allowUnlimitedContractSize: true,
		},
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
	typechain: process.env.HARDHAT_WEB3_TYPE
		? {
				outDir: 'web3-types', // For external web3 usage
				target: 'web3-v1',
		  }
		: {
				outDir: 'test-types', // For hardhat testing usage
				target: 'ethers-v5',
		  },

	mocha: {
		timeout: 400000,
	},
};

export default config;
