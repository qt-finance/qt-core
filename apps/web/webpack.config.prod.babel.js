import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';

import media from './config/media';
import env from './config/env';
import endpoint from './config/endpoint';

const terserDevOptions = {
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
};

const terserProductionOptions = {
	terserOptions: {
		ecma: 5,
		parse: {},
		compress: {
			warnings: false,
			// Disabled because of an issue with Uglify breaking seemingly valid code:
			// https://github.com/facebook/create-react-app/issues/2376
			// Pending further investigation:
			// https://github.com/mishoo/UglifyJS2/issues/2011
			comparisons: false,
			drop_console: true,
		},
		mangle: true,
		output: {
			comments: false,
			// Turned on because emoji and regex is not minified properly using default
			// https://github.com/facebook/create-react-app/issues/2488
			ascii_only: true,
		},
	},
	// Use multi-process parallel running to improve the build speed
	// Default number of concurrent runs: os.cpus().length - 1
	parallel: true,
};

const webpackProdConfig = {
	devtool: 'source-map',
	mode: process.env.NODE_ENV,
	entry: {
		app: ['core-js/modules/es.array.iterator', './src/index.tsx'],
	},
	output: {
		path: path.join(__dirname, 'public'),
		filename: '[name].[chunkhash].js',
		chunkFilename: '[name].[chunkhash].chunk.js',
		publicPath: '/',
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': { ...env, ...endpoint },
		}),

		new HtmlWebpackPlugin({
			template: './src/index.html',
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				removeScriptTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
			inject: true,
			showErrors: false,
			filename: 'index.html',
			chunksSortMode: 'auto',
		}),

		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: '[name].[contenthash].css',
			chunkFilename: '[id].[contenthash].css',
		}),
	],
	optimization: {
		moduleIds: 'deterministic',
		minimizer: [
			new TerserPlugin(
				process.env.NODE_ENV === 'production' ? terserProductionOptions : terserDevOptions,
			),
			new CssMinimizerPlugin(),
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
					// cacheGroupKey here is `commons` as the key of the cacheGroup
					name(module, chunks, cacheGroupKey) {
						const moduleFileName = module
							.identifier()
							.split('/')
							.reduceRight(item => item);
						const allChunksNames = chunks.map(item => item.name).join('~');
						return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
					},
				},
			},
		},
		runtimeChunk: 'single',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				include: [path.join(__dirname, 'src')],
				exclude: path.join(__dirname, '..', '..', 'node_modules'),
				loader: 'babel-loader',
				options: {
					presets: [
						['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3, loose: true }],
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
					babelrc: false,
				},
			},
			{
				test: /\.module.css$/,
				include: [path.join(__dirname, 'src'), path.join(__dirname, 'config')],
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: process.env.NODE_ENV !== 'production',
							modules: {
								exportLocalsConvention: 'camelCase',
								localIdentName: '[name]__[local]___[hash:base64:5]',
							},
							importLoaders: 1,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: process.env.NODE_ENV !== 'production',
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
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: process.env.NODE_ENV !== 'production',
						},
					},
				],
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

// Minify and optimize the CSS
if (process.env.NODE_ENV === 'production') {
	webpackProdConfig.plugins.push(new CompressionPlugin({ test: /\.(js|css|html)$/ }));
}

export default webpackProdConfig;
