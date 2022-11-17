import React from 'react';

import Header from 'components/organisms/Header';
import Footer from 'components/organisms/Footer';

interface AppProperty {
	children: React.ReactNode;
}

const App: React.FC<AppProperty> = ({ children }) => (
	<>
		<Header />
		{children}
		<Footer />
	</>
);

export default App;
