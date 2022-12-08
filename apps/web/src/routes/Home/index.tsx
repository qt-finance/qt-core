import React from 'react';

// import CloseIcon from 'images/icon/close.inline.svg';

import styles from './index.module.css';

const Home: React.FC = () => (
	<div className={styles.home}>
		<div className={styles.section}>
			<div className={styles.name}>WETH-USDC</div>
			<div className={styles.name}>$10000</div>
			<button className={styles.button} type="button">
				Join
			</button>
		</div>
		<div className={styles.section} />
	</div>
);

export default Home;
