import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { tradePoolAddress } from '@qt-core/core';

import { ModalTypes, useModal } from 'models/modal';
import { useBalance } from 'models/balance';
import { useWallet } from 'models/wallet';

import styles from './index.module.css';
import Modal from '../Modal';

interface JoinModalProperty {
	className?: string;
}

const JoinModal: React.FC<JoinModalProperty> = ({ className }) => {
	const [, walletModel] = useWallet();
	const [{ type }, modalModel] = useModal();
	const [{ usdc }, balanceModel] = useBalance();
	const [num, setNum] = useState<number>(0);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newNum = parseInt(e.target.value, 10);

		if (Number.isNaN(newNum)) {
			setNum(0);
		} else {
			setNum(newNum);
		}
	};

	const onApprove = async () => {
		await walletModel.approveUSDC(num);
		await balanceModel.getAllowance(tradePoolAddress);
	};

	const onJoin = async () => {
		await walletModel.joinPendingPool(num);

		modalModel.close();
	};

	useEffect(() => {
		if (type === ModalTypes.Join) {
			balanceModel.getAllowance(tradePoolAddress);
		}
	}, [type]);

	return (
		<Modal className={classnames(styles.joinModal, className)} type={ModalTypes.Join}>
			<h3>Join WETH-USDC Pool</h3>
			<div>Your Available USDC: {usdc.balance.toString()}</div>
			<div className={styles.action}>
				<input type="number" placeholder="Number of USDC" value={num} onChange={onChange} />
				{usdc.allowance.toNumber() === 0 ? (
					<button type="button" onClick={onApprove}>
						Approve
					</button>
				) : (
					<button type="button" onClick={onJoin}>
						Join
					</button>
				)}
				<button type="button" onClick={() => modalModel.close()}>
					Cancle
				</button>
			</div>
		</Modal>
	);
};

export default JoinModal;
