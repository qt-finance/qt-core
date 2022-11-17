import React, { Suspense } from 'react';
import { History } from 'history';

import App from 'layouts/App';

import { HistoryContext } from 'models/routing';

import useRouter, { CustomRoute } from 'util/hook/useRouter';

const Loading: React.FC = () => <div>Loading...</div>;

interface RouterProperty {
	routes: CustomRoute<[]>;
	history: History;
}

const Router: React.FC<RouterProperty> = ({ routes, history }) => {
	const { loading, component } = useRouter(routes, history);

	return (
		<HistoryContext.Provider value={history}>
			<App>{loading ? <Loading /> : <Suspense fallback={<Loading />}>{component}</Suspense>}</App>
		</HistoryContext.Provider>
	);
};

export default Router;
