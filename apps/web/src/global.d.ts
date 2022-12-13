/// <reference types="react" />
/// <reference types="react-dom" />

import { AbstractProvider } from 'web3-core';

declare module '*.module.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module '*.inline.svg' {
	import * as React from 'react';

	export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
	const src: string;
	export default src;
}

declare global {
	interface Window {
		ethereum?: AbstractProvider;
	}
}
