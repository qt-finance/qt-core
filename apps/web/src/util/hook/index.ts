import { useState } from 'react';

interface Option {
	onTrue?: () => void;
	onFalse?: () => void;
	defaultBoolean?: boolean;
}

type useBooleanFunc = (
	options: Option,
) => [boolean, { toggle: () => void; setFalse: () => void; setTrue: () => void }];

export const useBoolean: useBooleanFunc = options => {
	const { onTrue = () => {}, onFalse = () => {}, defaultBoolean = false } = options;

	const [state, setState] = useState<boolean>(defaultBoolean);

	const toggle = () => {
		if (state) {
			onFalse();
		} else {
			onTrue();
		}
		setState(!state);
	};

	const setFalse = () => {
		setState(false);
		onFalse();
	};

	const setTrue = () => {
		setState(true);
		onTrue();
	};

	return [state, { toggle, setFalse, setTrue }];
};
