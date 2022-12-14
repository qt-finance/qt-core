import type { ComponentStoryObj, ComponentMeta } from '@storybook/react';
import Balance from 'components/molecules/Balance';

export default {
	title: 'molecules/Balance',
	component: Balance,
} as ComponentMeta<typeof Balance>;

export const Interactive: ComponentStoryObj<typeof Balance> = {};
