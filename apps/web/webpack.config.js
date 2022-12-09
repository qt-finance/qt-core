import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import media from './config/media';
import env from './config/env';
import endpoint from './config/endpoint';

export default {
	devtool: 'eval-cheap-module-source-map',
	mode: 'development',
	entry: {
		app: ['webpack-hot-middleware/client', './src/index.tsx'],
	},
	output: {
		path: path.join(__dirname, 'public'),
		filename: '[name].bundle.js',
		publicPath: '/',
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new ReactRefreshWebpackPlugin(),
		new webpack.DefinePlugin({
			'process.env': { ...env, ...endpoint },
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
			chunksSortMode: 'auto',
		}),
	],
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					ecma: 5,
					compress: {
						warnings: false,
						comparisons: false,
					},
					output: {
						comments: false,
						ascii_only: false,
					},
				},
			}),
		],
		// Automatically split vendor and commons
		// https://hackernoon.com/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
		splitChunks: {
			chunks: 'all',
			maxInitialRequests: Infinity,
			minSize: 0,
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: 'commons',
					chunks: 'all',
				},
			},
		},
		runtimeChunk: 'single',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				include: path.join(__dirname, 'src'),
				exclude: path.join(__dirname, '..', '..', 'node_modules'),
				loader: 'babel-loader',
				options: {
					presets: [
						['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3, loose: true }],
						'@babel/preset-react',
						'@babel/preset-typescript',
					],
					plugins: [
						'react-refresh/babel',
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
					babelrc: false,
				},
			},
			{
				test: /\.module.css$/,
				include: [path.join(__dirname, 'src'), path.join(__dirname, 'config')],
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: {
								exportLocalsConvention: 'camelCase',
								localIdentName: '[name]__[local]___[hash:base64:5]',
							},
							importLoaders: 1,
							sourceMap: true,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							postcssOptions: {
								plugins: [
									'postcss-import',
									[
										'postcss-preset-env',
										{
											stage: 0,
											importFrom: [
												{
													customMedia: media,
												},
											],
											features: {
												'custom-properties': {
													disableDeprecationNotice: true,
												},
											},
										},
									],
								],
							},
						},
					},
				],
			},
			{
				test: /\.css$/,
				include: path.join(__dirname, '..', '..', 'node_modules'),
				use: ['style-loader', { loader: 'css-loader', options: { sourceMap: true } }],
			},
			{
				test: /\.(jpe?g|png|gif)$/,
				include: path.join(__dirname, 'src'),
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: './assets/[name]__[contenthash].[ext]',
				},
			},
			{
				test: /^(?!.*\.inline\.svg$).*\.svg$/,
				include: path.join(__dirname, 'src'),
				use: [
					'@svgr/webpack',
					{
						loader: 'url-loader',
						options: {
							limit: 10000,
							name: './assets/[name]__[contenthash].[ext]',
						},
					},
				],
			},
			// Weboack 5 new config for asset
			// {
			// 	test: /\.(svg|ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
			// 	type: 'asset/resource',
			// 	generator: { filename: 'static/media/[path][name][ext]' }
			// }
			{
				test: /\.inline.svg$/,
				include: path.join(__dirname, 'src'),
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
		],
	},
	resolve: {
		modules: ['node_modules'],
		extensions: ['.ts', '.tsx', '.js'],
	},
};
