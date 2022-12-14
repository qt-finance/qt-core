import React from 'react';
import classnames from 'classnames';

import { useBalance } from 'models/balance';

import styles from './index.module.css';

interface BalanceProperty {
	className?: string;
}

const Balance: React.FC<BalanceProperty> = ({ className }) => {
	const [{ usdc, weth, tradePool }] = useBalance();

	return (
		<div className={classnames(styles.balance, className)}>
			<h2>My Balance</h2>
			<div className={styles.content}>
				<div>USDC: {usdc.balance.toString()}</div>
				<div>WETH: {weth.balance.toString()}</div>
				<div>qWETH-USDC: {tradePool.balance.toString()}</div>
			</div>
			<h2>In Pending Pool</h2>
			<div className={styles.content}>
				<div>USDC: {tradePool.accountData.asset.toString()}</div>
				<div>Round: {tradePool.accountData.round.toString()}</div>
			</div>
		</div>
	);
};

export default Balance;
