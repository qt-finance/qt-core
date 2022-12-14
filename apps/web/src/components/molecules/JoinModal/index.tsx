import React from 'react';
import classnames from 'classnames';

import { ModalTypes, useModal } from 'models/modal';

import { useBalance } from 'models/balance';
import Modal from '../Modal';

import styles from './index.module.css';

interface JoinModalProperty {
	className?: string;
}

const JoinModal: React.FC<JoinModalProperty> = ({ className }) => {
	const [, modalModel] = useModal();
	const [{ usdc }] = useBalance();

	return (
		<Modal className={classnames(styles.joinModal, className)} type={ModalTypes.Join}>
			<h3>Join WETH-USDC Pool</h3>
			<div>Your Available USDC: {usdc.balance.toString()}</div>
			<div className={styles.action}>
				<input type="number" placeholder="Number of USDC" />
				<button type="button">Join</button>
				<button type="button" onClick={() => modalModel.close()}>
					Cancle
				</button>
			</div>
		</Modal>
	);
};

export default JoinModal;
