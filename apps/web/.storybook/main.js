require('@babel/register');

const media = require('../config/media').default;
const path = require('path');

const env = require('../config/env').default;
const endpoint = require('../config/endpoint').default;

module.exports = {
	core: {
		builder: 'webpack5',
	},
	stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		{
			name: '@storybook/addon-postcss',
			options: {
				postcssLoaderOptions: {
					implementation: require('postcss'), // eslint-disable-line global-require
					postcssOptions: {
						plugins: [
							'postcss-import',
							[
								'postcss-preset-env',
								{
									stage: 0,
									importFrom: [
										path.join(__dirname, '..', 'config', 'palette.css'),
										{
											customMedia: media,
										},
									],
									preserve: false,
								},
							],
						],
					},
				},
			},
		},
		{
			name: 'storybook-css-modules',
			options: {
				cssModulesLoaderOptions: {
					localsConvention: 'camelCase',
					modules: {
						localIdentName: '[name]__[local]___[hash:base64:5]',
					},
					importLoaders: 1,
				},
			},
		},
	],
	framework: '@storybook/react',
	features: {
		previewCsfV3: true,
	},

	env: config => {
		const envResult = { ...config };

		Object.keys(env).map(k => {
			envResult[k] = JSON.parse(env[k]);
		});

		Object.keys(endpoint).map(k => {
			envResult[k] = JSON.parse(endpoint[k]);
		});

		return envResult;
	},

	webpackFinal: async config => {
		// `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
		// You can change the configuration based on that.
		// 'PRODUCTION' is used when building the static version of storybook.

		// Make whatever fine-grained changes you need
		// eslint-disable-next-line no-param-reassign
		config.module.rules = [
			...config.module.rules.map(rule => {
				if (/svg/.test(rule.test) && /asset/.test(rule.type)) {
					return { ...rule, exclude: /\.inline.svg$/i };
				}

				return rule;
			}),
			{
				test: /\.inline.svg$/,
				include: path.join(__dirname, '..', 'src'),
				loader: '@svgr/webpack',
				options: {
					svgoConfig: {
						plugins: [
							{
								name: 'preset-default',
								params: {
									overrides: {
										cleanupIDs: false,
										removeViewBox: false,
									},
								},
							},
						],
					},
				},
			},
		];

		// Return the altered config
		return config;
	},
};
