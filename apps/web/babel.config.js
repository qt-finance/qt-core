const babelConfigForWebpackBuild = {
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'usage',
				corejs: 3,
				loose: true,
			},
		],
		'@babel/preset-react',
		'@babel/preset-typescript',
	],
	plugins: [
		[
			'module-resolver',
			{
				root: ['./src'],
				alias: {
					components: './src/components',
					images: './src/images',
					layouts: './src/layouts',
					models: './src/models',
					routes: './src/routes',
					store: './src/store',
					util: './src/util',
				},
			},
		],
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-syntax-import-meta',
		'@babel/plugin-proposal-json-strings',
		'@babel/plugin-transform-react-constant-elements',
		'babel-plugin-transform-typescript-metadata',
		['@babel/plugin-proposal-decorators', { version: 'legacy' }],
		['@babel/plugin-proposal-class-properties', { loose: true }],
	],
};

const babelConfigForJest = {
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'usage',
				corejs: 3,
				targets: {
					node: 'current',
				},
			},
		],
		'@babel/preset-react',
		'@babel/preset-typescript',
	],
	plugins: [
		[
			'module-resolver',
			{
				root: ['./src'],
				alias: {
					components: './src/components',
					images: './src/images',
					layouts: './src/layouts',
					models: './src/models',
					routes: './src/routes',
					store: './src/store',
					util: './src/util',
				},
			},
		],
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-syntax-import-meta',
		'@babel/plugin-proposal-json-strings',
		'@babel/plugin-transform-react-constant-elements',
		'babel-plugin-transform-typescript-metadata',
		['@babel/plugin-proposal-decorators', { version: 'legacy' }],
		['@babel/plugin-proposal-class-properties', { loose: true }],
	],
};

module.exports = api => {
	const isTest = api.env('test');

	if (isTest) {
		return babelConfigForJest;
	}

	return babelConfigForWebpackBuild;
};
