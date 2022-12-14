import React from 'react';
import classnames from 'classnames';

import { useBalance } from 'models/balance';

import styles from './index.module.css';

interface BalanceProperty {
	className?: string;
}

const Balance: React.FC<BalanceProperty> = ({ className }) => {
	const [{ usdc, weth, tradePool, price }] = useBalance();

	return (
		<div className={classnames(styles.balance, className)}>
			<h2>My Balance</h2>
			<div className={styles.content}>
				<div>USDC: {usdc.balance.toString()}</div>
				<div>WETH: {weth.balance.toString()}</div>
				<div>qWETH-USDC: {tradePool.balance.toString()}</div>
			</div>
			<h4>Price</h4>
			<div className={styles.content}>
				<div>WETH: {price.weth.toString()}</div>
			</div>
		</div>
	);
};

export default Balance;
