import React from 'react';

import { MemberModel } from 'models/member';

import { CustomRoute } from 'util/hook/useRouter';

export const sleep = (time: number): Promise<undefined> =>
	new Promise(resolve => setTimeout(resolve, time));

const routes: CustomRoute<[MemberModel]> = {
	path: '/members',
	components: () => [import(/* webpackChunkName: 'members' */ './component')],
	render: ([Members]) => <Members />,
	providers: [MemberModel],
	onEnter: async (_, [memberModel]) => {
		console.log('on Enter member');

		await memberModel.reset();
		await memberModel.fetchData();

		console.log('on Enter member / end');
		await sleep(5000);
	},
};
export default routes;
