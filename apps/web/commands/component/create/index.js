import { prompt } from 'enquirer';

import { createComponentFiles } from './fileWriter';

const questions = [
	{
		type: 'input',
		name: 'name',
		message: 'component name:',
		validate: input => {
			if (input) {
				return true;
			}

			return 'component name is required!';
		},
	},
	{
		type: 'select',
		name: 'scope',
		message: 'component scope:',
		choices: ['atom', 'molecule', 'organism', 'layout'],
		default: 'atom',
	},
	{
		type: 'confirm',
		name: 'storybook',
		message: 'do you want to create storybook test?',
		default: true,
	},
];

const createComponent = async () => {
	const { name, scope, storybook } = await prompt(questions);
	await createComponentFiles({ name, scope, storybook });
};

createComponent();
