export const genComponentContent = _componentName =>
	`import React from 'react';
import classnames from 'classnames';

import styles from './index.module.css';

interface ${_componentName}Property {
	className: string;
}

const ${_componentName}: React.FC<${_componentName}Property> = ({ className }) => (
	<div className={classnames(styles.${
		_componentName.charAt(0).toLowerCase() + _componentName.slice(1)
	}, className)}>${_componentName}</div>
);

export default ${_componentName};
`;

export const genStyleContent = _componentName => {
	const transferClassName = oldName =>
		oldName
			.split('')
			.map((letter, index) => {
				if (letter !== letter.toLowerCase()) {
					if (index !== 0) {
						return `-${letter.toLowerCase()}`;
					}

					return letter.toLowerCase();
				}
				return letter;
			})
			.join('');

	return `.${transferClassName(_componentName)} {}\n`;
};

export const genStorybookContent = (_componentName, _scope) => {
	const componentPosition = _scope === 'layout' ? 'layouts' : `components/${_scope}s`;
	const componentImportText = `import type { ComponentStoryObj, ComponentMeta } from '@storybook/react';
import ${_componentName} from '${componentPosition}/${_componentName}';\n\n`;

	const storyContent = `export default {
	title: '${_scope}s/${_componentName}',
	component: ${_componentName},
} as ComponentMeta<typeof ${_componentName}>;

export const Interactive: ComponentStoryObj<typeof ${_componentName}> = {};
`;

	const storybookContent = componentImportText + storyContent;

	return storybookContent;
};

export const genSnapshotTestContent = _componentName =>
	`import React from 'react';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/testing-react';

import * as stories from './${_componentName}.stories';

const testCases = Object.values(composeStories(stories)).map(Story => [Story.storyName!, Story]);

// Batch snapshot testing
test.each(testCases)('Renders %s story', async (_storyName, Story) => {
	const tree = await render(<Story />);
	expect(tree.baseElement).toMatchSnapshot();
});
`;
