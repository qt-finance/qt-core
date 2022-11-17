import { Injectable } from 'injection-js';
import type { ComponentStoryObj, ComponentMeta } from '@storybook/react';

import MemberList from 'components/molecules/MemberList';
import { MemberModel, MemberModelState } from 'models/member';

@Injectable()
class MockMemberModel extends MemberModel {
	protected setupDefaultState(): MemberModelState {
		return {
			staffs: {
				Jessy: {
					no: '19',
					name: 'Lee',
					fullname: 'Lee',
					nickname: 'Lee',
					type: 'Official',
					OnBoardDate: '2022/01/01',
					email: 'example@25sprout.com',
					github: '',
					website: '',
					sexual: 'Male',
					birthday: '1900/01/01',
					pic: {
						small: '',
						large: '',
					},
					title: ['Front-End Developer'],
				},
			},
		};
	}
}

export default {
	title: 'molecules/MemberList',
	component: MemberList,
} as ComponentMeta<typeof MemberList>;

export const Interactive: ComponentStoryObj<typeof MemberList> = {
	parameters: {
		// Mock di data
		di: {
			models: [MemberModel],
		},
	},
};

export const WithDefaultMember: ComponentStoryObj<typeof MemberList> = {
	parameters: {
		// Mock di data
		di: {
			models: [{ provide: MemberModel, useClass: MockMemberModel }],
		},
	},
};
