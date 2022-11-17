import type { ComponentStoryObj, ComponentMeta } from '@storybook/react';
import List from 'components/atoms/List';

export default {
	title: 'atoms/List',
	component: List,
	argTypes: {
		items: {
			control: { type: 'object' },
		},
	},
} as ComponentMeta<typeof List>;

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

export const Interactive: ComponentStoryObj<typeof List> = {
	args: {
		items,
	},
};
