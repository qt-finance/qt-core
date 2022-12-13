import { AbstractProvider } from 'web3-core';

declare module '*.css' {
	const classes: { [key: string]: string };
	export default classes;
}

declare module '*.inline.svg' {
	import React = require('react');

	export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
	const src: string;
	export default src;
}

declare global {
	interface Window {
		ethereum?: AbstractProvider;
	}
}
