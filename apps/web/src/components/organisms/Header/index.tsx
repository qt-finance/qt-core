import React from 'react';

import Navigation from 'components/molecules/Navigation';

import styles from './index.module.css';

const Header: React.FC = () => (
	<header className={styles.header}>
		<h2>This is header</h2>
		<Navigation />
	</header>
);

export default Header;
