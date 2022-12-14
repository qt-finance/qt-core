export const normalizeNum = (num: bigint, decimal: bigint): bigint => {
	const expScale = 10n ** decimal;

	return num / expScale;
};
