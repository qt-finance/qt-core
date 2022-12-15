import React, { useState } from 'react';
import classnames from 'classnames';

import { ModalTypes, useModal } from 'models/modal';
import { useBalance } from 'models/balance';
import { useWallet } from 'models/wallet';

import styles from './index.module.css';
import Modal from '../Modal';

interface JoinModalProperty {
	className?: string;
}

const RedeemModal: React.FC<JoinModalProperty> = ({ className }) => {
	const [, walletModel] = useWallet();
	const [, modalModel] = useModal();
	const [{ tradePool }] = useBalance();
	const [num, setNum] = useState<number>(0);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newNum = parseInt(e.target.value, 10);

		if (Number.isNaN(newNum)) {
			setNum(0);
		} else {
			setNum(newNum);
		}
	};

	const onRedeem = async () => {
		await walletModel.redeem(num);

		modalModel.close();
	};

	return (
		<Modal className={classnames(styles.redeemModal, className)} type={ModalTypes.Redeem}>
			<h3>Redeem</h3>
			<div>Your Available Shares: {tradePool.balance.toString()}</div>
			<div className={styles.action}>
				<input type="number" placeholder="Number of Shares" value={num} onChange={onChange} />
				<button type="button" onClick={onRedeem}>
					Redeem
				</button>
				<button type="button" onClick={() => modalModel.close()}>
					Cancle
				</button>
			</div>
		</Modal>
	);
};

export default RedeemModal;
