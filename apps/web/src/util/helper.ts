export const normalizeNum = (num: bigint, decimal: bigint): bigint => {
	const expScale = 10n ** decimal;

	return num / expScale;
};

export const scaleNum = (num: number, decimal: bigint): bigint => {
	const expScale = 10n ** decimal;

	return BigInt(num) * expScale;
};
