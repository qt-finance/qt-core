export default {
	// Set production mode or development mode
	NODE_ENV: process.env.NODE_ENV && `"${process.env.NODE_ENV}"`,

	// Set API endpoint
	API: process.env.API && `"${process.env.API}"`,
	PROXY: process.env.PROXY && `"${process.env.PROXY}"`,

	DEV: JSON.stringify(process.env.API === 'dev'),
	DEVELOP: JSON.stringify(process.env.API === 'develop'),
	PRODUCTION: JSON.stringify(process.env.API === 'production'),
};
