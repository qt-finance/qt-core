import React from 'react';

import ToggleButton from 'components/atoms/ToggleButton';
import List from 'components/atoms/List';

import { useMember } from 'models/member';

const MemberList: React.FC = () => {
	const [{ staffs }, memberModel] = useMember();

	return (
		<div>
			<ToggleButton onOpen={memberModel.fetchData} onClose={memberModel.reset} />
			<List items={Object.keys(staffs).map(key => ({ key, value: staffs[key].name }))} />
		</div>
	);
};

export default MemberList;
