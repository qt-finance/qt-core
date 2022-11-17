import {
	useState,
	useEffect,
	useMemo,
	lazy,
	useRef,
	FC,
	ReactElement,
	ComponentType,
	useCallback,
	useContext,
} from 'react';
import UniversalRouter, { RouterOptions, RouteContext, Route } from 'universal-router';
import { History } from 'history';
import { ReflectiveInjector } from 'injection-js';

import { useRouting } from 'models/routing';

import { DIContext, IBasicModel, resolveProviders } from 'util/di';
import useLocation from './useLocation';

export interface CustomRouteContext extends RouteContext {
	history: History;
	injector: ReflectiveInjector;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CustomRoute<T extends IBasicModel<Record<string, any>>[]> extends Route {
	onEnter?: (R: CustomRouteContext, M: T) => Promise<ReactElement | boolean | void | undefined>;
	components: () => Promise<{ default: ComponentType }>[];
	render: (C: FC[], R: ReactElement) => ReactElement;
	children?: Route[];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	providers?: { [key in keyof T]: { new (...p: any[]): T[key] } };
}

const options: RouterOptions = {
	baseUrl: '',
	async resolveRoute(ctx) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const route = ctx.route as CustomRoute<IBasicModel<Record<string, any>>[]>;
		const { next } = ctx;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let models: IBasicModel<Record<string, any>>[] = [];

		if (typeof route.providers !== 'undefined') {
			models = resolveProviders(ctx.injector, route.providers);
		}

		let children;

		if (typeof route.onEnter === 'function') {
			children = await route.onEnter(ctx as CustomRouteContext, models);
		}

		// Do not Enter children
		if (children === false) {
			return null;
		}

		if (typeof children === 'undefined') {
			children = await next();
		}

		// Skip routes without render() function
		if (!route.render) {
			return null;
		}

		// Start downloading missing JavaScript chunks
		const components = route.components
			? route.components().map(component => lazy(() => component))
			: [];

		const result = route.render(components, children);

		return result;
	},
	errorHandler(error, context) {
		console.info('errorHandler: ', error, context);
		return error.status === 404 ? '<h1>Page Not Found</h1>' : '<h1>Oops! Something went wrong</h1>';
	},
};

interface useRouterReturnType {
	loading: boolean;
	component: ReactElement | null;
}

const useRouter = (routes: CustomRoute<[]>, history: History): useRouterReturnType => {
	const { injector } = useContext(DIContext);
	const location = useLocation(history);
	const [, routingModel] = useRouting();
	const router = useMemo(() => new UniversalRouter(routes, options), [routes]);
	const [Component, setComponent] = useState({ loading: false, component: null });

	// Referrence the route index
	const lastIndex = useRef(0);

	const asyncLocationChange = useCallback(async () => {
		setComponent(prevComponent => ({ ...prevComponent, loading: true }));
		lastIndex.current += 1;

		// Use function scope to index current change route
		const index = lastIndex.current;

		const LazyComponent = await router.resolve({
			pathname: location.pathname,
			history,
			injector,
		});

		// Detect the latest change index for prevent updating the wrong route view
		if (index === lastIndex.current) {
			setComponent({ loading: false, component: LazyComponent });
		}
	}, [history, location.pathname, router]);

	useEffect(() => {
		asyncLocationChange();
	}, [asyncLocationChange]);

	useEffect(() => {
		routingModel.routeChange(location);
	}, [location]);

	return Component;
};

export default useRouter;
