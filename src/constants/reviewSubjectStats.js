function hexToRgba(hex, alpha) {
    const normalizedHex = hex.replace('#', '');
    const numericValue = Number.parseInt(normalizedHex, 16);

    if (normalizedHex.length !== 6 || Number.isNaN(numericValue)) {
        return hex;
    }

    const red = (numericValue >> 16) & 255;
    const green = (numericValue >> 8) & 255;
    const blue = numericValue & 255;

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const SUBJECT_PALETTE = [
    { name: 'Toán', color: '#9787ff' },
    { name: 'Vật lý', color: '#5bd222' },
    { name: 'Tiếng Anh', color: '#0096ff' },
    { name: 'Hóa học', color: '#ffa5da' },
    { name: 'Sinh học', color: '#fdb600' },
    { name: 'Lịch sử', color: '#c4d0fb' },
    { name: 'Địa lý', color: '#6a5ae0' },
];

function createSubject(subject, entry) {
    return {
        name: subject.name,
        color: subject.color,
        share: entry.share,
        percent: `${entry.share}%`,
        time: entry.time,
        correct: entry.correct,
        incorrect: entry.incorrect,
        borderColor: hexToRgba(subject.color, 0.2),
        progressWidth: Math.round((entry.share / 100) * 344),
    };
}

function buildSubjects(entries) {
    return SUBJECT_PALETTE.map((subject, index) => createSubject(subject, entries[index]));
}

export const REVIEW_SUBJECT_STATS_TIME_OPTIONS = [
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'quarter', label: '3 tháng gần nhất' },
    { value: 'year', label: 'Năm nay' },
];

export const REVIEW_SUBJECT_STATS_DEFAULT_PERIOD = 'week';

export const REVIEW_SUBJECT_STATS_BY_PERIOD = {
    week: {
        centerLabel: 'Tổng thời gian',
        centerValue: '12h',
        subjects: buildSubjects([
            { share: 22, time: '5h30m', correct: 10, incorrect: 2 },
            { share: 18, time: '4h20m', correct: 8, incorrect: 2 },
            { share: 16, time: '4h05m', correct: 7, incorrect: 2 },
            { share: 14, time: '3h40m', correct: 6, incorrect: 2 },
            { share: 12, time: '3h05m', correct: 5, incorrect: 1 },
            { share: 10, time: '2h45m', correct: 4, incorrect: 1 },
            { share: 8, time: '2h15m', correct: 3, incorrect: 1 },
        ]),
    },
    month: {
        centerLabel: 'Tổng thời gian',
        centerValue: '48h',
        subjects: buildSubjects([
            { share: 20, time: '10h20m', correct: 19, incorrect: 5 },
            { share: 18, time: '9h45m', correct: 17, incorrect: 5 },
            { share: 16, time: '8h30m', correct: 15, incorrect: 4 },
            { share: 15, time: '7h50m', correct: 14, incorrect: 4 },
            { share: 12, time: '6h20m', correct: 11, incorrect: 3 },
            { share: 10, time: '5h10m', correct: 9, incorrect: 2 },
            { share: 9, time: '4h25m', correct: 8, incorrect: 2 },
        ]),
    },
    quarter: {
        centerLabel: 'Tổng thời gian',
        centerValue: '146h',
        subjects: buildSubjects([
            { share: 19, time: '31h45m', correct: 28, incorrect: 8 },
            { share: 18, time: '29h10m', correct: 27, incorrect: 7 },
            { share: 16, time: '26h30m', correct: 24, incorrect: 7 },
            { share: 14, time: '22h45m', correct: 21, incorrect: 6 },
            { share: 12, time: '19h55m', correct: 18, incorrect: 5 },
            { share: 11, time: '17h30m', correct: 16, incorrect: 4 },
            { share: 10, time: '15h25m', correct: 14, incorrect: 4 },
        ]),
    },
    year: {
        centerLabel: 'Tổng thời gian',
        centerValue: '512h',
        subjects: buildSubjects([
            { share: 18, time: '102h', correct: 44, incorrect: 13 },
            { share: 17, time: '95h', correct: 42, incorrect: 12 },
            { share: 16, time: '88h', correct: 38, incorrect: 11 },
            { share: 15, time: '78h', correct: 35, incorrect: 10 },
            { share: 13, time: '67h', correct: 31, incorrect: 9 },
            { share: 11, time: '55h', correct: 26, incorrect: 7 },
            { share: 10, time: '47h', correct: 22, incorrect: 6 },
        ]),
    },
};

export { hexToRgba };