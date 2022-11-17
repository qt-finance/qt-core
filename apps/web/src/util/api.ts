import qs from 'qs';

const { API_ENDPOINT } = process.env;

export const generateUrl = (url: string, params?: Record<string, unknown>): string => {
	const paramsString = qs.stringify(params, { arrayFormat: 'brackets' });

	const URL =
		paramsString !== '' ? `${API_ENDPOINT}/${url}?${paramsString}` : `${API_ENDPOINT}/${url}`;

	return URL;
};

export const wrapFetch = async <T = Record<string, unknown>>(
	url: string,
	options = { headers: {} },
	params = {},
): Promise<T> => {
	const URL = generateUrl(url, params);

	const headers = new Headers({
		'Content-Type': 'application/json',
		Accept: 'application/json',
		...options.headers,
	});

	const result = await fetch(URL, { ...options, headers });

	return result.json();
};
