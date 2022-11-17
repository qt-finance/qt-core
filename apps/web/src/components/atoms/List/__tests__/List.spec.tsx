import React from 'react';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/testing-react';

import List from 'components/atoms/List';

import * as stories from './List.stories';

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

const items = [
	{
		key: '1',
		value: 'Lee',
	},
	{
		key: '2',
		value: 'Mike',
	},
];

test('should have items property', () => {
	const { getByTestId } = render(<List items={items} />);

	expect(getByTestId('1')).toHaveTextContent('Lee');
});
