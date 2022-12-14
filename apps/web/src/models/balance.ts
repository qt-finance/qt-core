import { Injectable } from 'injection-js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { tradePoolAddress, USDCAddress, WETHAddress } from '@qt-core/core';
import ERC20Abi from '@qt-core/core/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import { ERC20 } from '@qt-core/core/web3-types/@openzeppelin/contracts/token/ERC20';
import { TradePool as TradePoolContract } from '@qt-core/core/web3-types/contracts/TradePool';
import TradePoolAbi from '@qt-core/core/artifacts/contracts/TradePool.sol/TradePool.json';
import BigNumber from 'bignumber.js';

import { BasicModel, useDI } from 'util/di';
import { useEffect } from 'react';
import { normalizeNum } from 'util/helper';
import { useConnectWeb3 } from './wallet';

export interface BalanceState {
	web3: Web3;
	account: string;
	usdc: {
		contract: ERC20;
		balance: BigNumber;
		allowance: BigNumber;
	};
	weth: {
		contract: ERC20;
		balance: BigNumber;
		allowance: BigNumber;
	};
	tradePool: {
		contract: TradePoolContract;
		balance: BigNumber;
		usdcBalance: BigNumber;
		wethBalance: BigNumber;
		valueIndex: BigNumber;
		assetOnPendingPool: BigNumber;
		accountData: {
			asset: BigNumber;
			index: number;
			valueIndex: BigNumber;
			round: number;
		};
		pendingPool: {
			currentRound: number;
		};
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

		const tradePoolContract = new web3.eth.Contract(
			TradePoolAbi.abi as AbiItem[],
			tradePoolAddress,
		) as unknown as TradePoolContract;

		const zero = new BigNumber(0);

		return {
			web3,
			account: '',
			usdc: {
				contract: usdcContract,
				balance: zero,
				allowance: zero,
			},
			weth: {
				contract: wethContract,
				balance: zero,
				allowance: zero,
			},
			tradePool: {
				contract: tradePoolContract,
				balance: zero,
				usdcBalance: zero,
				wethBalance: zero,
				valueIndex: zero,
				assetOnPendingPool: zero,
				accountData: {
					asset: zero,
					index: 0,
					valueIndex: zero,
					round: 0,
				},
				pendingPool: {
					currentRound: 0,
				},
			},
		};
	}

	public setupAccount = (account: string) => {
		this.setState(s => ({ ...s, account }));
	};

	public getAllowance = async (contract: string) => {
		const { account, usdc } = this.getState();

		if (account === '') {
			return;
		}

		const allowance = await usdc.contract.methods.allowance(account, contract).call();

		this.setState(s => ({
			...s,
			usdc: { ...s.usdc, allowance: normalizeNum(BigInt(allowance), 6n) },
		}));
	};

	public subscribeContract = () => {
		const { account, usdc, weth, tradePool } = this.getState();

		console.log('BalanceModel: start subscribeContract', account);

		if (account === '') {
			return () => {};
		}

		const onUpdate = async () => {
			const [
				usdcBalance,
				wethBalance,
				tradePoolShares,
				valueIndex,
				assetOnPendingPool,
				accountData,
				pendingPool,
				tradePoolUSDCBalance,
				tradePoolWETHBalance,
			] = await Promise.all([
				usdc.contract.methods.balanceOf(account).call(),
				weth.contract.methods.balanceOf(account).call(),
				tradePool.contract.methods.balanceOf(account).call(),
				// tradePool.contract.methods.valueIndex().call(),
				tradePool.contract.methods.previewValueIndex().call(),
				tradePool.contract.methods.getAssetOnPendingPool(account).call(),
				tradePool.contract.methods.accountData(account).call(),
				tradePool.contract.methods.pendingPool().call(),
				usdc.contract.methods.balanceOf(tradePoolAddress).call(),
				weth.contract.methods.balanceOf(tradePoolAddress).call(),
			]);

			this.setState(s => ({
				...s,
				usdc: { ...s.usdc, balance: normalizeNum(BigInt(usdcBalance), 6n) },
				weth: { ...s.weth, balance: normalizeNum(BigInt(wethBalance), 18n) },
				tradePool: {
					...s.tradePool,
					balance: normalizeNum(BigInt(tradePoolShares), 18n),
					usdcBalance: normalizeNum(BigInt(tradePoolUSDCBalance), 6n),
					wethBalance: normalizeNum(BigInt(tradePoolWETHBalance), 18n),
					valueIndex: normalizeNum(BigInt(valueIndex), 18n),
					assetOnPendingPool: normalizeNum(BigInt(assetOnPendingPool), 6n),
					accountData: {
						asset: normalizeNum(BigInt(accountData.asset), 6n),
						index: parseInt(accountData.index, 10),
						valueIndex: normalizeNum(BigInt(accountData.valueIndex), 18n),
						round: parseInt(accountData.round, 10),
					},
					pendingPool: {
						currentRound: parseInt(pendingPool.currentRound, 10),
					},
				},
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
