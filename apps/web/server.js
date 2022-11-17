/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-var-requires */

import webpack from 'webpack';
import express from 'express';
import history from 'connect-history-api-fallback';
import httpProxy from 'http-proxy';

import { HOST_MAP } from './config/endpoint';

import config from './webpack.config';

const host = HOST_MAP[process.env.PROXY];

const app = express();
const compiler = webpack(config);

app.use(history());

app.use(
	require('webpack-dev-middleware')(compiler, {
		publicPath: config.output.publicPath,
		stats: {
			chunks: false,
			colors: true,
		},
	}),
);

app.use(require('webpack-hot-middleware')(compiler));

app.listen(3000, err => {
	if (err) {
		return console.error(err);
	}

	const proxyServer = httpProxy.createProxyServer({
		target: host,
		changeOrigin: true,
	});

	proxyServer.on('proxyReq', proxyReq => {
		proxyReq.setHeader('Origin', host);
	});

	proxyServer.on('proxyRes', proxyRes => {
		proxyRes.headers['Access-Control-Allow-Headers'] = 'content-type, authorization';
		proxyRes.headers['Access-Control-Allow-Methods'] = 'PUT, POST, GET, DELETE';
		proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
	});

	console.log(`Proxy ${process.env.PROXY} server ${host} start at localhost:9000`);

	proxyServer.listen(9000);

	return console.log('Listening at http://localhost:3000/');
});
