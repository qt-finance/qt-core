import { useBalance } from 'models/balance';
import React from 'react';

// import CloseIcon from 'images/icon/close.inline.svg';

import styles from './index.module.css';

const Home: React.FC = () => {
	const [{ usdc, weth }] = useBalance();

	return (
		<div className={styles.home}>
			<div className={styles.balance}>
				<h2>My Balance</h2>
				<div className={styles.content}>
					<div>USDC: {usdc.balance.toString()}</div>
					<div>WETH: {weth.balance.toString()}</div>
					<div>qWETH-USDC:</div>
				</div>
			</div>
			<div className={styles.section}>
				<div className={styles.name}>WETH-USDC</div>
				<div className={styles.name}>$10000</div>
				<button className={styles.button} type="button">
					Join
				</button>
			</div>
			{/* <div className={styles.section} /> */}
		</div>
	);
};

export default Home;
