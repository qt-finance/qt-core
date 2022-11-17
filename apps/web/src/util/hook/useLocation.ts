import { useState, useEffect } from 'react';

import { History, Location } from 'history';

const useLocation = (history: History): Location => {
	const [location, setLocation] = useState<Location>(history.location);

	useEffect(() => {
		const unlisten = history.listen(({ location: newLocation }) => {
			setLocation(newLocation);
		});
		return () => unlisten();
	}, [history]);

	return location;
};

export default useLocation;
