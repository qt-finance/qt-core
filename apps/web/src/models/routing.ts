import { createContext, useContext } from 'react';
import { Location, History } from 'history';
import { Injectable } from 'injection-js';

import { BasicModel, useDI } from 'util/di';

import history from 'store/history';

export const HistoryContext = createContext<History>(history);

export const useHistory = (): History => useContext(HistoryContext);

@Injectable()
export class RoutingModel extends BasicModel<Location> {
	protected setupDefaultState(): Location {
		return {
			...history.location,
		};
	}

	public routeChange = (location: Location) => {
		this.setState(location);
	};
}

export const useRouting = () => useDI<Location, RoutingModel>(RoutingModel);
