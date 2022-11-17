import { Injectable } from 'injection-js';
import { wrapFetch } from 'util/api';

import { BasicModel, useDI } from 'util/di';

interface Staff {
	no: string;
	name: string;
	fullname: string;
	nickname: string;
	type: string;
	OnBoardDate: string;
	email: string;
	github: string;
	website: string;
	sexual: string;
	birthday: string;
	pic: {
		small: string;
		large: string;
	};
	title: string[];
}

export interface MemberModelState {
	staffs: { [props: string]: Staff };
}

@Injectable()
export class MemberModel extends BasicModel<MemberModelState> {
	protected setupDefaultState(): MemberModelState {
		return {
			staffs: {},
		};
	}

	public fetchData = async () => {
		try {
			const data = await wrapFetch<MemberModelState>('avatar/apo/25sproutMember.php');

			this.setState(data);

			return data;
		} catch (error) {
			this.setState({ staffs: {} });

			return { staffs: {} };
		}
	};

	public reset = async () => {
		this.setState({ staffs: {} });
	};
}

export const useMember = () => useDI<MemberModelState, MemberModel>(MemberModel);
