import React from 'react';
import Link from 'components/atoms/Link';

const Navigator: React.FC = () => (
	<nav>
		<ul>
			<li>
				<Link to="/">Home</Link>
			</li>
			<li>
				<Link to="/members">Members</Link>
			</li>
		</ul>
	</nav>
);

export default Navigator;
