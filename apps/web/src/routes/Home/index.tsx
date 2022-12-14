import React from 'react';

import Balance from 'components/molecules/Balance';
// import CloseIcon from 'images/icon/close.inline.svg';

import { ModalTypes, useModal } from 'models/modal';

import JoinModal from 'components/molecules/JoinModal';

import { useBalance } from 'models/balance';

import styles from './index.module.css';

const Home: React.FC = () => {
	const [, modelModal] = useModal();

	const [{ tradePool }] = useBalance();

	return (
		<div className={styles.home}>
			<Balance />
			<div className={styles.section}>
				<div className={styles.head}>
					<h3>WETH-USDC</h3>
					<button
						className={styles.button}
						type="button"
						onClick={() => modelModal.open(ModalTypes.Join)}
					>
						Join
					</button>
				</div>
				<div className={styles.content}>
					<div>ValueIndex: {tradePool.valueIndex.toString()}</div>
					<div>CurrentRound: {tradePool.pendingPool.currentRound.toString()}</div>
					<div>USDC: {tradePool.usdcBalance.toString()}</div>
					<div>WETH: {tradePool.wethBalance.toString()}</div>
				</div>
			</div>
			<JoinModal />
			{/* <div className={styles.section} /> */}
		</div>
	);
};

export default Home;
