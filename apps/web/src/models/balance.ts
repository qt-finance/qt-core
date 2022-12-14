import { Injectable } from 'injection-js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { USDCAddress, WETHAddress } from '@qt-core/core';
import ERC20Abi from '@qt-core/core/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import { ERC20 } from '@qt-core/core/web3-types/@openzeppelin/contracts/token/ERC20';

import { BasicModel, useDI } from 'util/di';
import { useEffect } from 'react';
import { normalizeNum } from 'util/helper';
import { useConnectWeb3 } from './wallet';

export interface BalanceState {
	web3: Web3;
	account: string;
	usdc: {
		contract: ERC20;
		balance: bigint;
	};
	weth: {
		contract: ERC20;
		balance: bigint;
	};
}

@Injectable()
export class BalanceModel extends BasicModel<BalanceState> {
	protected setupDefaultState(): BalanceState {
		const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545/'));

		const usdcContract = new web3.eth.Contract(
			ERC20Abi.abi as AbiItem[],
			USDCAddress,
		) as unknown as ERC20;

		const wethContract = new web3.eth.Contract(
			ERC20Abi.abi as AbiItem[],
			WETHAddress,
		) as unknown as ERC20;

		return {
			web3,
			account: '',
			usdc: {
				contract: usdcContract,
				balance: 0n,
			},
			weth: {
				contract: wethContract,
				balance: 0n,
			},
		};
	}

	public setupAccount = (account: string) => {
		this.setState(s => ({ ...s, account }));
	};

	public subscribeContract = () => {
		const { account, usdc, weth } = this.getState();

		console.log('BalanceModel: start subscribeContract', account);

		if (account === '') {
			return () => {};
		}

		const onUpdate = async () => {
			const [usdcBalance, wethBalance] = await Promise.all([
				usdc.contract.methods.balanceOf(account).call(),
				weth.contract.methods.balanceOf(account).call(),
			]);

			this.setState(s => ({
				...s,
				usdc: { ...s.usdc, balance: normalizeNum(BigInt(usdcBalance), 6n) },
				weth: { ...s.weth, balance: normalizeNum(BigInt(wethBalance), 18n) },
			}));
		};

		const intervalId = setInterval(onUpdate, 5000);

		// First Time Update
		onUpdate();

		return () => {
			console.log('BalanceModel: cancel subscribeContract');
			clearInterval(intervalId);
		};
	};
}

export const useBalance = (): [BalanceState, BalanceModel] => {
	const [state, balanceModel] = useDI<BalanceState, BalanceModel>(BalanceModel);
	const [{ myAccount }] = useConnectWeb3();

	useEffect(() => {
		balanceModel.setupAccount(myAccount);

		return balanceModel.subscribeContract();
	}, [myAccount]);

	return [state, balanceModel];
};
