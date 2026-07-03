function createBar(value, correct, incorrect) {
	return {
		label: 'Xác suất',
		value,
		tooltip: {
			title: 'Xác suất thống kê',
			correct,
			incorrect,
		},
	};
}

export const REVIEW_RESULTS_TIME_OPTIONS = [
	{ value: 'week', label: 'Tuần này' },
	{ value: 'month', label: 'Tháng này' },
	{ value: 'quarter', label: '3 tháng gần nhất' },
	{ value: 'year', label: 'Năm nay' },
];

export const REVIEW_RESULTS_AXIS_LABELS = ['100%', '80%', '60%', '40%', '20%', '0'];

export const REVIEW_RESULTS_STATS_BY_PERIOD = {
	week: {
		bars: [
			createBar(56, 16, 4),
			createBar(52, 14, 4),
			createBar(43, 13, 5),
			createBar(35, 10, 2),
			createBar(30, 9, 3),
			createBar(24, 7, 3),
		],
		defaultActiveIndex: 3,
	},
	month: {
		bars: [
			createBar(61, 18, 5),
			createBar(57, 17, 5),
			createBar(48, 15, 5),
			createBar(42, 12, 4),
			createBar(36, 11, 4),
			createBar(29, 8, 3),
		],
		defaultActiveIndex: 2,
	},
	quarter: {
		bars: [
			createBar(68, 20, 6),
			createBar(64, 19, 6),
			createBar(58, 17, 6),
			createBar(51, 15, 5),
			createBar(46, 13, 5),
			createBar(39, 11, 4),
		],
		defaultActiveIndex: 3,
	},
	year: {
		bars: [
			createBar(74, 24, 8),
			createBar(69, 22, 7),
			createBar(63, 20, 7),
			createBar(57, 18, 6),
			createBar(50, 16, 6),
			createBar(44, 14, 5),
		],
		defaultActiveIndex: 3,
	},
};

export const REVIEW_RESULTS_DEFAULT_PERIOD = 'week';