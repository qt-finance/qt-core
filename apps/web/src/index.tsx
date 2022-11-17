import 'core-js/features/reflect';
import 'whatwg-fetch';

import React from 'react';
import { createRoot } from 'react-dom/client';

// A modern alternative to CSS resets
import 'normalize.css?node';
// Global css setting
import './global.css';

import Router from 'layouts/Router';

import history from 'store/history';

import routes from 'routes';

import { rootModels } from 'models';

import { DIProvider } from 'util/di';

const rootElement = document.getElementById('content');

if (rootElement !== null) {
	const root = createRoot(rootElement);

	root.render(
		<DIProvider value={rootModels}>
			<Router history={history} routes={routes} />
		</DIProvider>,
	);
}
