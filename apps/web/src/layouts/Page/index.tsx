import React from 'react';

import styles from './index.css';

interface PageLayoutSetting {
	PageHeader: string;
	PageContent: React.FC;
}

const PageLayout = ({ PageHeader, PageContent }: PageLayoutSetting): React.FC => () => (
	<div className={styles.page}>
		<header>{PageHeader}</header>
		<div>
			<PageContent />
		</div>
	</div>
);

export default PageLayout;
