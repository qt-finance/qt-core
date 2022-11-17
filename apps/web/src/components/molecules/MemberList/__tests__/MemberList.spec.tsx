import React from 'react';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/testing-react';

import * as stories from './MemberList.stories';

const testCases = Object.values(composeStories(stories)).map(Story => [
	// The ! is necessary in Typescript only, as the property is part of a partial type
	Story.storyName!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
	Story,
]);
// Batch snapshot testing
test.each(testCases)('Renders %s story', async (_storyName, Story) => {
	const tree = await render(<Story />);
	expect(tree.baseElement).toMatchSnapshot();
});
