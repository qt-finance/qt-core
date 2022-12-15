import React from 'react';
import classnames from 'classnames';
import BigNumber from 'bignumber.js';

import Balance from 'components/molecules/Balance';
import JoinModal from 'components/molecules/JoinModal';
import RedeemModal from 'components/molecules/RedeemModal';

import { ModalTypes, useModal } from 'models/modal';
import { useBalance } from 'models/balance';

import styles from './index.module.css';

const calculateProfit = (diffValueIndex: BigNumber, Sahres: BigNumber): string => {
	if (diffValueIndex.eq(0)) {
		return '0';
	}

	if (diffValueIndex.gt(0)) {
		return `+${diffValueIndex.multipliedBy(Sahres).toString()}`;
	}

	return `${diffValueIndex.multipliedBy(-1).multipliedBy(Sahres).toString()}`;
};

const Home: React.FC = () => {
	const [, modelModal] = useModal();

	const [{ tradePool }] = useBalance();

	const diffValueIndex = tradePool.valueIndex.minus(tradePool.accountData.valueIndex);

	const noPendingPool = tradePool.pendingPool.total.eq(0);

	return (
		<div className={styles.home}>
			<Balance />
			<div className={styles.section}>
				<div className={styles.head}>
					<h2>WETH-USDC</h2>
					<div className={styles.action}>
						<button
							className={styles.button}
							type="button"
							onClick={() => modelModal.open(ModalTypes.Join)}
						>
							Join
						</button>
						{tradePool.balance.toNumber() > 0 && (
							<button
								className={styles.button}
								type="button"
								onClick={() => modelModal.open(ModalTypes.Redeem)}
							>
								Redeem
							</button>
						)}
					</div>
				</div>
				<div className={styles.content}>
					<div>ValueIndex: {tradePool.valueIndex.toString()}</div>
					<div>CurrentRound: {tradePool.pendingPool.currentRound.toString()}</div>
					<div>USDC: {tradePool.usdcBalance.toString()}</div>
					<div>WETH: {tradePool.wethBalance.toString()}</div>
				</div>
				<h4>Pending Pool</h4>
				<div className={styles.content}>
					<div>Total: {tradePool.pendingPool.total.toString()}</div>
					<div>CurrentRound: {tradePool.pendingPool.currentRound.toString()}</div>
				</div>
				<h4>Your Asset in Pool</h4>
				<div className={styles.content}>
					<div>USDC: {noPendingPool ? 0 : tradePool.accountData.asset.toString()}</div>
					<div>Round: {tradePool.accountData.round.toString()}</div>
					<div>ValueIndex: {tradePool.accountData.valueIndex.toString()}</div>
					<div className={classnames(styles.profit, { [styles.green]: diffValueIndex.gte(0) })}>
						Profit: {calculateProfit(diffValueIndex, tradePool.balance)}
					</div>
				</div>
			</div>
			<JoinModal />
			<RedeemModal />
			{/* <div className={styles.section} /> */}
		</div>
	);
};

export default Home;
