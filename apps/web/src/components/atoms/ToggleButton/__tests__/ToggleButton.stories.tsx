import type { ComponentStoryObj, ComponentMeta } from '@storybook/react';

import ToggleButton from 'components/atoms/ToggleButton';

export default {
	title: 'atoms/ToggleButton',
	component: ToggleButton,
	argTypes: {
		onOpen: { action: 'open' },
		onClose: { action: 'close' },
		openTitle: { control: { type: 'text' } },
		closeTitle: { control: { type: 'text' } },
	},
} as ComponentMeta<typeof ToggleButton>;

export const Interactive: ComponentStoryObj<typeof ToggleButton> = {
	args: {
		openTitle: 'Open Title',
		closeTitle: 'Close Title',
	},
};
