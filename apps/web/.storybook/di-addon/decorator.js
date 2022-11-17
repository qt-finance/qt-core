import React from 'react';

import { DIProvider } from '../../src/util/di';

export const MockDIDecorator = (Story, context) => {
	const {
		parameters: { di },
	} = context;

	if (typeof di === 'undefined') {
		return <Story />;
	}

	return (
		<DIProvider value={di.models}>
			<Story />
		</DIProvider>
	);
};
