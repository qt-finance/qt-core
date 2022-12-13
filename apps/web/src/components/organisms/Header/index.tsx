import { useConnectWeb3 } from 'models/wallet';
import React from 'react';

// import Navigation from 'components/molecules/Navigation';

import styles from './index.module.css';

const Header: React.FC = () => {
	const [{ myAccount }, walletModel] = useConnectWeb3();

	return (
		<header className={styles.header}>
			<h2>QT Finance</h2>
			{/* <Navigation /> */}
			{myAccount !== '' ? (
				<div>{myAccount}</div>
			) : (
				<button className={styles.button} type="button" onClick={walletModel.connect}>
					Connect Wallet
				</button>
			)}
		</header>
	);
};

export default Header;
