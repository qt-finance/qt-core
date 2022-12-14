import React, { useLayoutEffect, useRef } from 'react';
import classnames from 'classnames';
import { createPortal } from 'react-dom';

import { ModalTypes, useModal } from 'models/modal';

import styles from './index.module.css';

interface ModalProperty {
	children?: React.ReactNode;
	onClose?: () => void;
	type: ModalTypes;
	className?: string;
}

const ModalComponent: React.FC<ModalProperty> = ({
	children,
	onClose = () => {},
	type,
	className,
}) => {
	const [{ type: currentType }, modalModel] = useModal();

	// 非打開狀態就不 render 底下的 modal，直接 return
	if (type !== currentType) {
		return null;
	}

	const onCloseClick = () => {
		modalModel.close();
		onClose();
	};

	return (
		<div
			className={styles.backdrop}
			onClick={() => {
				onCloseClick();
			}}
			onKeyDown={() => {}}
			role="button"
			tabIndex={-1}
		>
			<div
				className={classnames(styles.modal, className)}
				onClick={e => {
					e.stopPropagation();
				}}
				onKeyDown={() => {}}
				role="button"
				tabIndex={-1}
			>
				{children}
			</div>
		</div>
	);
};

const Modal: React.FC<ModalProperty> = ({ children, onClose, type, className }) => {
	const refDiv = useRef(document.createElement('div'));

	useLayoutEffect(() => {
		let modalRoot = document.getElementById('modal-root');

		if (modalRoot === null) {
			modalRoot = document.createElement('div');
			modalRoot.setAttribute('id', 'modal-root');
			document.body.appendChild(modalRoot);
		}

		modalRoot.appendChild(refDiv.current);

		return () => {
			if (modalRoot) {
				modalRoot.removeChild(refDiv.current);
			}
		};
	}, []);

	// ReactDOM.createPortal(要渲染什麼東西, 在哪裡渲染這個東西)
	return createPortal(
		<ModalComponent onClose={onClose} type={type} className={className}>
			{children}
		</ModalComponent>,
		refDiv.current,
	);
};

export default Modal;
