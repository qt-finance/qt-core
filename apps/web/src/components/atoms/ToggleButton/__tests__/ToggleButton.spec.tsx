import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { composeStories } from '@storybook/testing-react';

import ToggleButton from 'components/atoms/ToggleButton';

import * as stories from './ToggleButton.stories';

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

test('should have default value: Close', () => {
	const { container } = render(<ToggleButton onOpen={() => {}} onClose={() => {}} />);
	expect((container.firstChild as HTMLButtonElement).innerHTML).toMatch('Close');
});

// Create custom snapshot testing
test('should become Open after click', () => {
	const { container } = render(<ToggleButton onOpen={() => {}} onClose={() => {}} />);

	expect(container).toMatchSnapshot();

	// manually trigger the callback
	fireEvent.click(container.firstChild as HTMLButtonElement);

	expect((container.firstChild as HTMLButtonElement).innerHTML).toMatch('Open');
	// re-rendering would become Open
	expect(container).toMatchSnapshot();

	// manually trigger the callback
	fireEvent.click(container.firstChild as HTMLButtonElement);

	expect((container.firstChild as HTMLButtonElement).innerHTML).toMatch('Close');
	// re-rendering would become Close
	expect(container).toMatchSnapshot();
});
