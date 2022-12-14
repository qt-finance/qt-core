import React from 'react';

import Balance from 'components/molecules/Balance';
// import CloseIcon from 'images/icon/close.inline.svg';

import { ModalTypes, useModal } from 'models/modal';

import JoinModal from 'components/molecules/JoinModal';

import styles from './index.module.css';

const Home: React.FC = () => {
	const [, modelModal] = useModal();

	return (
		<div className={styles.home}>
			<Balance />
			<div className={styles.section}>
				<div className={styles.name}>WETH-USDC</div>
				<div className={styles.name}>$10000</div>
				<button
					className={styles.button}
					type="button"
					onClick={() => modelModal.open(ModalTypes.Join)}
				>
					Join
				</button>
			</div>
			<JoinModal />
			{/* <div className={styles.section} /> */}
		</div>
	);
};

export default Home;
