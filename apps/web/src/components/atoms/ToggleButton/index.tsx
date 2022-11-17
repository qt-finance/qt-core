import React from 'react';
import classnames from 'classnames';

import { useBoolean } from 'util/hook';

import style from './index.module.css';

interface ToggleButtonProperty {
	onClose: () => void;
	onOpen: () => void;
	closeTitle?: string;
	openTitle?: string;
}

const ToggleButton: React.FC<ToggleButtonProperty> = ({
	onClose,
	onOpen,
	closeTitle = 'Close',
	openTitle = 'Open',
}) => {
	const [isOpen, { toggle }] = useBoolean({
		onTrue: onOpen,
		onFalse: onClose,
		defaultBoolean: true,
	});

	return (
		<button
			type="button"
			className={classnames(style.button, {
				[style.reverse]: !isOpen,
			})}
			onClick={toggle}
		>
			{isOpen ? closeTitle : openTitle}
		</button>
	);
};

export default ToggleButton;
