import React from 'react';

export interface Item {
	key: string;
	value: string;
}

interface ListProperty {
	items: Item[];
}

const List: React.FC<ListProperty> = ({ items }) => (
	<ul>
		{items.map(item => (
			<li key={item.key} data-testid={item.key}>
				{item.value}
			</li>
		))}
	</ul>
);

export default List;
