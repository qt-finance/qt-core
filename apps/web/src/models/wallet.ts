import { Injectable } from 'injection-js';
import Web3 from 'web3';
import { AbstractProvider } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { USDCAddress, tradePoolAddress } from '@qt-core/core';
import ERC20Abi from '@qt-core/core/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import { ERC20 } from '@qt-core/core/web3-types/@openzeppelin/contracts/token/ERC20';

import TradePoolAbi from '@qt-core/core/artifacts/contracts/TradePool.sol/TradePool.json';
import { TradePool as TradePoolContract } from '@qt-core/core/web3-types/contracts/TradePool';

import { BasicModel, useDI } from 'util/di';
import { useEffect } from 'react';
import { scaleNum } from 'util/helper';

export const isSupportWeb3 =
	typeof window.ethereum !== 'undefined' && typeof window.ethereum.request !== 'undefined';

export interface WalletState {
	web3: Web3 | null;
	myAccount: string;
	contract: {
		USDC: ERC20 | null;
		TradePool: TradePoolContract | null;
	};
}

@Injectable()
export class WalletModel extends BasicModel<WalletState> {
	protected setupDefaultState(): WalletState {
		return {
			web3: null,
			myAccount: '',
			contract: {
				USDC: null,
				TradePool: null,
			},
		};
	}

	private _setWallet = async (walletAddress: string) => {
		const web3 = new Web3(window.ethereum as AbstractProvider);

		console.log('USDC', USDCAddress);
		console.log('Trade Pool', tradePoolAddress);

		const usdcContract = new web3.eth.Contract(ERC20Abi.abi as AbiItem[], USDCAddress, {
			from: walletAddress,
		}) as unknown as ERC20;

		const tradePoolContract = new web3.eth.Contract(
			TradePoolAbi.abi as AbiItem[],
			tradePoolAddress,
			{ from: walletAddress },
		) as unknown as TradePoolContract;

		this.setState(s => ({
			...s,
			web3,
			myAccount: Web3.utils.toChecksumAddress(walletAddress),
			contract: {
				...s.contract,
				USDC: usdcContract,
				TradePool: tradePoolContract,
			},
		}));
	};

	public checkConnection = async () => {
		if (isSupportWeb3) {
			const account = await window.ethereum?.request?.({ method: 'eth_accounts' });

			if (typeof account !== 'undefined' && account[0]) {
				// console.log(account[0]);

				await this._setWallet(account[0]);
			}
		}
	};

	public connect = async () => {
		if (isSupportWeb3) {
			await window.ethereum?.request?.({ method: 'eth_requestAccounts' });
			const web3 = new Web3(window.ethereum as AbstractProvider);

			const account = web3.eth.accounts;
			// Get the current MetaMask selected/active wallet
			const walletAddress = account.givenProvider.selectedAddress;
			console.log(`Wallet: ${walletAddress}`);

			await this._setWallet(walletAddress);
		} else {
			console.log('No wallet');
		}
	};

	public approveUSDC = async (num: number) => {
		const {
			contract: { USDC },
		} = this.getState();

		console.log('approve USDC', num);

		if (USDC === null) {
			return;
		}

		try {
			await USDC.methods.approve(tradePoolAddress, scaleNum(num, 6n).toString()).send();
		} catch (error) {
			console.log('approve USDC failed');
			console.log(error);
		}
	};

	public joinPendingPool = async (num: number) => {
		const {
			contract: { TradePool },
		} = this.getState();

		if (TradePool === null) {
			return;
		}

		console.log('join pending pool', num);

		try {
			await TradePool.methods.joinPendingPool(scaleNum(num, 6n).toString()).send();
		} catch (error) {
			console.log('join pending pool failed');
			console.log(error);
		}
	};
}

export const useConnectWeb3 = (): [WalletState, WalletModel] => {
	const [state, walletModel] = useDI<WalletState, WalletModel>(WalletModel);

	useEffect(() => {
		walletModel.checkConnection();
	}, []);

	return [state, walletModel];
};

export const useWallet = () => useDI<WalletState, WalletModel>(WalletModel);
