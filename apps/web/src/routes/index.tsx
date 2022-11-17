import React from 'react';

import { CustomRoute } from 'util/hook/useRouter';

import MembersRoute from './Members';
// import BlogsRoute from './Blogs';

const childrenHomeRoute: CustomRoute<[]> = {
	path: '',
	components: () => [import(/* webpackChunkName: 'home' */ './Home')],
	render: ([Home]) => <Home />,
	onEnter: async ({ next }) => {
		console.log('on Enter Home');
		const children = await next();
		console.log('on Enter Home / end');
		return children;
	},
};

const routes: CustomRoute<[]> = {
	path: '/',
	components: () => [],
	render: (_, children) => children,
	onEnter: async ({ next }) => {
		console.log('on Enter Root');
		const children = await next();
		console.log('on Enter Root / end');

		return children;
	},
	children: [childrenHomeRoute, MembersRoute],
};

export default routes;
