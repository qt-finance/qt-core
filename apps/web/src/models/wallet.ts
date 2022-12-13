import { Injectable } from 'injection-js';
import Web3 from 'web3';
import { AbstractProvider } from 'web3-core';

import { BasicModel, useDI } from 'util/di';
import { useEffect } from 'react';

export const isSupportWeb3 =
	typeof window.ethereum !== 'undefined' && typeof window.ethereum.request !== 'undefined';

export interface WalletState {
	web3: Web3 | null;
	myAccount: string;
}

@Injectable()
export class WalletModel extends BasicModel<WalletState> {
	protected setupDefaultState(): WalletState {
		return {
			web3: null,
			myAccount: '',
		};
	}

	public checkConnection = async () => {
		if (isSupportWeb3) {
			const account = await window.ethereum?.request?.({ method: 'eth_accounts' });

			if (typeof account !== 'undefined' && account[0]) {
				console.log(account[0]);

				const web3 = new Web3(window.ethereum as AbstractProvider);

				this.setState({ web3, myAccount: Web3.utils.toChecksumAddress(account[0]) });
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

			this.setState({ web3, myAccount: Web3.utils.toChecksumAddress(walletAddress) });
		} else {
			console.log('No wallet');
		}
	};
}

export const useConnectWeb3 = () => {
	const [state, walletModel] = useDI<WalletState, WalletModel>(WalletModel);

	useEffect(() => {
		walletModel.checkConnection();
	}, []);

	return [state, walletModel];
};
