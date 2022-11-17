export const HOST_MAP = {
	dev: 'http://localhost:9000',
	develop: 'http://lab.25sprout.com',
	production: 'http://lab.25sprout.com',
};

const SELF_HOST_MAP = {
	dev: 'http://localhost:3000',
	develop: '',
	production: '',
};

export const API_ENDPOINT = HOST_MAP[process.env.API];
export const SELF_HOST_ENDPOINT = SELF_HOST_MAP[process.env.API];

export default {
	// Set API endpoint
	API_ENDPOINT: `"${API_ENDPOINT}"`,
	SELF_HOST_ENDPOINT: `"${SELF_HOST_ENDPOINT}"`,
};
