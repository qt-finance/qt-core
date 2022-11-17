import 'core-js/features/reflect';
import 'normalize.css';

import '../src/global.css';

import { MockDIDecorator } from './di-addon/decorator';

export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
};

export const decorators = [MockDIDecorator];
