import type { ComponentStoryObj, ComponentMeta } from '@storybook/react';
import Modal from 'components/molecules/Modal';

export default {
	title: 'molecules/Modal',
	component: Modal,
} as ComponentMeta<typeof Modal>;

export const Interactive: ComponentStoryObj<typeof Modal> = {};
