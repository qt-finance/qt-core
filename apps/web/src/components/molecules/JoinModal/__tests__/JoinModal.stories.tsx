import type { ComponentStoryObj, ComponentMeta } from '@storybook/react';
import JoinModal from 'components/molecules/JoinModal';

export default {
	title: 'molecules/JoinModal',
	component: JoinModal,
} as ComponentMeta<typeof JoinModal>;

export const Interactive: ComponentStoryObj<typeof JoinModal> = {};
