import React from 'react';

import MemberList from 'components/molecules/MemberList';

import PageLayout from 'layouts/Page';

const PageContent = () => <MemberList />;

const Members = PageLayout({
	PageHeader: "Member's page",
	PageContent,
});

Members.displayName = 'Members';

export default Members;
