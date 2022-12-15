import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 100 });

export const normalizeNum = (num: bigint, decimal: bigint): BigNumber => {
	const expScale = 10n ** decimal;

	return new BigNumber(num.toString()).div(new BigNumber(expScale.toString()));
};

export const scaleNum = (num: number, decimal: bigint): BigNumber => {
	const expScale = 10n ** decimal;

	return new BigNumber(num).multipliedBy(new BigNumber(expScale.toString()));
};
