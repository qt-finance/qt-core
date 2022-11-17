import React, {
	useSyncExternalStore,
	createContext,
	FC,
	useContext,
	useState,
	ReactNode,
	useEffect,
	useMemo,
	useCallback,
} from 'react';
import { Provider, ReflectiveInjector } from 'injection-js';

type SetStateFunc<T> = (_d: T) => T;
type SubscriberFunc<T> = (_d: T) => void;

export interface IBasicModel<T> {
	setState(_a: T | SetStateFunc<T>): void;
	getState(): T;
	subscribe(subscriber: SubscriberFunc<T>): () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class BasicModel<T extends Record<string, any>> implements IBasicModel<T> {
	private subscribers;

	private state: T;

	protected abstract setupDefaultState(): T;

	constructor() {
		this.subscribers = new Set<SubscriberFunc<T>>();
		this.state = this.setupDefaultState();
	}

	public setState = (_a: T | SetStateFunc<T>): void => {
		if (typeof _a === 'function') {
			this.state = _a(this.state);
		} else {
			this.state = _a;
		}

		this.emit();
	};

	public getState = () => this.state;

	public subscribe = (subscriber: SubscriberFunc<T>) => {
		this.subscribers.add(subscriber);

		return () => this.subscribers.delete(subscriber);
	};

	protected emit = () => {
		this.subscribers.forEach(subscriber => subscriber(this.state));
	};
}

interface ContextType {
	injector: ReflectiveInjector | null;
	updateInjector?: React.Dispatch<React.SetStateAction<ReflectiveInjector>>;
}

export const DIContext = createContext<ContextType>({
	injector: null,
	updateInjector: () => {},
});

interface ParentDIProviderProps {
	injector: ReflectiveInjector;
	children: ReactNode;
}

const ParentDIProvider: FC<ParentDIProviderProps> = ({ injector, children }) => {
	const [injectorRoot, updateInjector] = useState<ReflectiveInjector>(injector);

	return (
		// eslint-disable-next-line react/jsx-no-constructed-context-values
		<DIContext.Provider value={{ injector: injectorRoot, updateInjector }}>
			{children}
		</DIContext.Provider>
	);
};

interface DIProviderProps {
	// Typof class
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: Provider[];
	children: ReactNode;
}

export const DIProvider: FC<DIProviderProps> = ({ value, children }) => {
	const { injector, updateInjector } = useContext(DIContext);

	const updatedInjector = useMemo<ReflectiveInjector>(
		() => ReflectiveInjector.resolveAndCreate(value, injector === null ? undefined : injector),
		value,
	);

	useEffect(() => {
		if (typeof updateInjector !== 'undefined') {
			updateInjector(updatedInjector);
		}
	}, [updatedInjector]);

	// No parent provider
	if (typeof updateInjector === 'undefined') {
		return <ParentDIProvider injector={updatedInjector}>{children}</ParentDIProvider>;
	}

	return (
		// eslint-disable-next-line react/jsx-no-constructed-context-values
		<DIContext.Provider value={{ injector: updatedInjector, updateInjector }}>
			{children}
		</DIContext.Provider>
	);
};

interface ContructorTypeOf<T> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new (...p: any[]): T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDI = <State extends Record<string, any>, T extends BasicModel<State>>(
	provider: ContructorTypeOf<T>,
): [State, T] => {
	const { injector } = useContext(DIContext);

	const model: T = injector?.get(provider);

	const state = useSyncExternalStore(model.subscribe, () => model.getState());

	return [state, model];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const resolveProviders = <Args extends IBasicModel<Record<string, any>>[]>(
	injector: ReflectiveInjector | null,
	providers: {
		[key in keyof Args]: ContructorTypeOf<Args[key]>;
	},
): Args => {
	if (injector === null) {
		return [] as unknown as Args;
	}

	return providers.map(provider => injector?.get(provider)) as Args;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDIs = <Args extends IBasicModel<Record<string, any>>[]>(
	...providers: { [key in keyof Args]: ContructorTypeOf<Args[key]> }
): Args => {
	const { injector } = useContext(DIContext);

	const models = resolveProviders(injector, providers) as Args;

	useSyncExternalStore(
		useCallback(cb => {
			const removeSubscribers = models.map(model => model.subscribe(cb));

			return () => {
				removeSubscribers.forEach(remove => remove());
			};
		}, []),
		() =>
			// For quickly check difference, has performance issue
			// Should wait for useSyncExternalStoreWithSelector
			// ref: https://github.com/reactwg/react-18/discussions/86
			models.map(model => `${JSON.stringify(model.getState())}`).join(','),
	);

	return models;
};
