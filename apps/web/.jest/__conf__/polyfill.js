global.requestAnimationFrame = callback => {
	setTimeout(callback, 0);
};

const currentDate = new Date('2019-07-01T00:00:00Z');

global.Date = class extends Date {
	constructor() {
		return currentDate;
	}
};

global.Date.now = jest.fn(() => currentDate.valueOf());

window.matchMedia = jest.fn().mockImplementation(query => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: jest.fn(),
	removeListener: jest.fn(),
}));
