import { Injectable } from 'injection-js';

import { BasicModel, useDI } from 'util/di';

const setModalBackgroundScrollY = () => {
	if (!document.body.classList.contains('no-scroll')) {
		document.body.style.top = `-${window.pageYOffset}px`;
		document.body.classList.add('no-scroll');
	}

	if (!document.documentElement.classList.contains('no-scroll')) {
		document.documentElement.classList.add('no-scroll');
	}
};

const restoreModalBackgroundScrollY = () => {
	document.documentElement.classList.remove('no-scroll');

	if (document.body.classList.contains('no-scroll')) {
		document.body.classList.remove('no-scroll');

		const matchesTop = document.body.style.top.match(/\d+/g);

		if (matchesTop !== null && matchesTop.length > 0) {
			document.body.style.top = 'unset';
			window.scrollTo(0, parseInt(matchesTop[0], 10));
		}
	}
};

export enum ModalTypes {
	Empty,
	Join,
	Redeem,
}

// export enum ModalTyp {}

export interface ModalModelState {
	type: ModalTypes;
	data: Record<string, unknown>;
	action: null;
}

@Injectable()
export class ModalModel extends BasicModel<ModalModelState> {
	protected setupDefaultState(): ModalModelState {
		return {
			type: ModalTypes.Empty,
			data: {},
			action: null,
		};
	}

	public open = (type: ModalTypes) => {
		setModalBackgroundScrollY();
		this.setState(s => ({ ...s, type }));
	};

	public close = () => {
		restoreModalBackgroundScrollY();
		this.setState(s => ({ ...s, type: ModalTypes.Empty }));
	};
}

export const useModal = () => useDI<ModalModelState, ModalModel>(ModalModel);
