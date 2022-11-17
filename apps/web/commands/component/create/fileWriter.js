import fs from 'fs/promises';
import { constants, createWriteStream } from 'fs';
import path from 'path';
import colors from 'colors/safe';

import {
	genComponentContent,
	genStyleContent,
	genStorybookContent,
	genSnapshotTestContent,
} from './contentGenerator';

export const createComponentFiles = async ({ name, scope, storybook }) => {
	const componentName = name.charAt(0).toUpperCase() + name.slice(1);
	const scopeDestination =
		scope !== 'layout'
			? path.join(__dirname, '..', '..', '..', 'src', 'components', `${scope}s`)
			: path.join(__dirname, '..', '..', '..', 'src', 'layouts');
	const componentFolder = path.join(scopeDestination, componentName);

	// check component exist
	try {
		await fs.access(componentFolder, constants.F_OK);

		console.error(colors.red(`COMPONENT_EXIST: ${scope}s/${componentName}`));
		// exist, should not override;
		return;
	} catch (error) {
		console.log(`Prepare create component: ${scope}s/${componentName}`);
	}

	try {
		await fs.mkdir(componentFolder);

		const componentContent = genComponentContent(componentName);

		// create index.tsx
		const indexFile = path.join(componentFolder, 'index.tsx');
		const indexWriteStream = createWriteStream(indexFile);

		indexWriteStream.write(componentContent);

		indexWriteStream.end();

		indexWriteStream.on('finish', () => {
			console.log('index.tsx 建立完成');
		});

		// create index.css
		const styleContent = genStyleContent(componentName);
		const styleFile = path.join(componentFolder, 'index.module.css');
		const styleWriteStream = createWriteStream(styleFile);
		styleWriteStream.write(styleContent);
		styleWriteStream.end();

		styleWriteStream.on('finish', () => {
			console.log('index.module.css 建立完成');
		});

		// create storybook test
		if (storybook) {
			const testFolder = path.join(componentFolder, '__tests__');

			await fs.mkdir(testFolder);

			const storybookContent = genStorybookContent(componentName, scope);

			const storybookFile = path.join(testFolder, `${componentName}.stories.tsx`);
			const storybookWriteStream = createWriteStream(storybookFile);

			storybookWriteStream.write(storybookContent);
			storybookWriteStream.end();

			storybookWriteStream.on('finish', () => {
				console.log('storybook 建立完成');
			});

			const snapshotTestContent = genSnapshotTestContent(componentName);

			const snapshotTestFile = path.join(testFolder, `${componentName}.spec.tsx`);
			const snapshotTestWriteStream = createWriteStream(snapshotTestFile);

			snapshotTestWriteStream.write(snapshotTestContent);
			snapshotTestWriteStream.end();

			snapshotTestWriteStream.on('finish', () => {
				console.log('snapshot test 建立完成');
			});
		}
	} catch (error) {
		console.log(error);
	}
};
