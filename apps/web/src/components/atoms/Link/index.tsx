import React, { MouseEvent } from 'react';

import { useHistory } from 'models/routing';
import { History } from 'history';

const onClickHandler = (callback: (e: MouseEvent<HTMLAnchorElement>) => void, history: History) => (
	e: MouseEvent<HTMLAnchorElement>,
): void => {
	e.preventDefault();
	history.push(e.currentTarget.pathname);
	callback(e);
};

interface LinkProperty {
	className?: string;
	to?: string;
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
	children: React.ReactChildren | string;
}

const Link: React.FC<LinkProperty> = ({ className, to, onClick = () => {}, children }) => {
	const history = useHistory();

	return (
		<a
			className={className}
			href={to}
			role="button"
			tabIndex={0}
			onClick={onClickHandler(onClick, history)}
			onKeyPress={() => {}}
		>
			{children}
		</a>
	);
};

export default Link;
