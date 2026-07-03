const REVIEW_ACTIVITY_STORAGE_KEY = 'uttq.review.activities.v1';
const REVIEW_ACTIVITY_EVENT = 'uttq:review-activity-updated';

const SUBJECT_COLORS = ['#9787ff', '#5bd222', '#0096ff', '#ffa5da', '#fdb600', '#c4d0fb', '#6a5ae0'];
const RESULT_PERIOD_OPTIONS = [
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'quarter', label: '3 tháng gần nhất' },
    { value: 'year', label: 'Năm nay' },
];

function isClient() {
    return typeof window !== 'undefined';
}

function safeDate(value) {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
}

function startOfDay(date) {
    const nextDate = new Date(date);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate;
}

function startOfWeek(date) {
    const nextDate = startOfDay(date);
    const day = nextDate.getDay() || 7;
    nextDate.setDate(nextDate.getDate() - day + 1);
    return nextDate;
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfQuarter(date) {
    return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
}

function startOfYear(date) {
    return new Date(date.getFullYear(), 0, 1);
}

function getPeriodStart(period, now = new Date()) {
    if (period === 'day') return startOfDay(now);
    if (period === 'month') return startOfMonth(now);
    if (period === 'quarter') return startOfQuarter(now);
    if (period === 'year') return startOfYear(now);
    return startOfWeek(now);
}

function readActivities() {
    if (!isClient()) return [];

    try {
        const rawValue = window.localStorage.getItem(REVIEW_ACTIVITY_STORAGE_KEY);
        const parsedValue = rawValue ? JSON.parse(rawValue) : [];
        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
        return [];
    }
}

function writeActivities(activities) {
    if (!isClient()) return;
    window.localStorage.setItem(REVIEW_ACTIVITY_STORAGE_KEY, JSON.stringify(activities.slice(0, 500)));
    window.dispatchEvent(new CustomEvent(REVIEW_ACTIVITY_EVENT));
}

function normalizeActivity(activity) {
    const completedAt = activity.completedAt ?? new Date().toISOString();
    const subjectTitle = activity.subjectTitle ?? activity.subjectName ?? 'Môn học';
    const exerciseTitle = activity.exerciseTitle ?? 'Bài ôn tập';

    return {
        id: activity.id ?? crypto.randomUUID(),
        type: activity.type ?? 'summary',
        subjectId: String(activity.subjectId ?? ''),
        subjectTitle,
        subjectCode: activity.subjectCode ?? '',
        exerciseId: String(activity.exerciseId ?? ''),
        exerciseTitle,
        documentId: activity.documentId ? String(activity.documentId) : '',
        startedAt: activity.startedAt ?? completedAt,
        completedAt,
        durationSeconds: Math.max(0, Math.round(Number(activity.durationSeconds) || 0)),
        progress: Math.max(0, Math.min(100, Math.round(Number(activity.progress) || 0))),
        score: Number(activity.score) || 0,
        correctCount: Math.max(0, Math.round(Number(activity.correctCount) || 0)),
        wrongCount: Math.max(0, Math.round(Number(activity.wrongCount) || 0)),
        blankCount: Math.max(0, Math.round(Number(activity.blankCount) || 0)),
        totalItems: Math.max(0, Math.round(Number(activity.totalItems ?? activity.totalQuestions) || 0)),
    };
}

function filterByPeriod(activities, period) {
    const start = getPeriodStart(period);
    return activities.filter((activity) => safeDate(activity.completedAt) >= start);
}

function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Math.round(totalSeconds || 0));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    if (hours > 0) return `${hours}h${minutes > 0 ? `${minutes}m` : ''}`;
    if (minutes > 0) return `${minutes}m`;
    return `${safeSeconds}s`;
}

function hexToRgba(hex, alpha) {
    const normalizedHex = hex.replace('#', '');
    const numericValue = Number.parseInt(normalizedHex, 16);

    if (normalizedHex.length !== 6 || Number.isNaN(numericValue)) return hex;

    const red = (numericValue >> 16) & 255;
    const green = (numericValue >> 8) & 255;
    const blue = numericValue & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildResultBuckets(period) {
    const now = new Date();

    if (period === 'week') {
        const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        return labels.map((label, index) => {
            const bucketStart = startOfWeek(now);
            bucketStart.setDate(bucketStart.getDate() + index);
            const bucketEnd = new Date(bucketStart);
            bucketEnd.setDate(bucketEnd.getDate() + 1);
            return { label, start: bucketStart, end: bucketEnd };
        });
    }

    if (period === 'year') {
        return Array.from({ length: 12 }, (_, index) => ({
            label: String(index + 1),
            start: new Date(now.getFullYear(), index, 1),
            end: new Date(now.getFullYear(), index + 1, 1),
        }));
    }

    const periodStart = period === 'quarter' ? startOfQuarter(now) : startOfMonth(now);
    const weekCount = period === 'quarter' ? 13 : 5;
    return Array.from({ length: weekCount }, (_, index) => {
        const bucketStart = new Date(periodStart);
        bucketStart.setDate(bucketStart.getDate() + index * 7);
        const bucketEnd = new Date(bucketStart);
        bucketEnd.setDate(bucketEnd.getDate() + 7);
        return { label: `T${index + 1}`, start: bucketStart, end: bucketEnd };
    });
}

function getBucketActivities(activities, bucket) {
    return activities.filter((activity) => {
        const completedAt = safeDate(activity.completedAt);
        return completedAt >= bucket.start && completedAt < bucket.end;
    });
}

function getAccuracy(activities) {
    const correct = activities.reduce((sum, activity) => sum + (activity.correctCount || 0), 0);
    const incorrect = activities.reduce((sum, activity) => sum + (activity.wrongCount || 0) + (activity.blankCount || 0), 0);
    const total = correct + incorrect;
    return {
        value: total > 0 ? Math.round((correct / total) * 100) : 0,
        correct,
        incorrect,
    };
}

function getTimeBuckets(period) {
    const now = new Date();

    if (period === 'day') {
        const dayStart = startOfDay(now);
        return Array.from({ length: 12 }, (_, index) => {
            const bucketStart = new Date(dayStart);
            bucketStart.setHours(index * 2, 0, 0, 0);
            const bucketEnd = new Date(bucketStart);
            bucketEnd.setHours(bucketEnd.getHours() + 2);
            return { label: String(index + 1), start: bucketStart, end: bucketEnd };
        });
    }

    if (period === 'year') {
        return Array.from({ length: 12 }, (_, index) => ({
            label: String(index + 1),
            start: new Date(now.getFullYear(), index, 1),
            end: new Date(now.getFullYear(), index + 1, 1),
        }));
    }

    if (period === 'month') {
        const monthStart = startOfMonth(now);
        return Array.from({ length: 5 }, (_, index) => {
            const bucketStart = new Date(monthStart);
            bucketStart.setDate(bucketStart.getDate() + index * 7);
            const bucketEnd = new Date(bucketStart);
            bucketEnd.setDate(bucketEnd.getDate() + 7);
            return { label: `Tuần ${index + 1}`, start: bucketStart, end: bucketEnd };
        });
    }

    const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    return labels.map((label, index) => {
        const bucketStart = startOfWeek(now);
        bucketStart.setDate(bucketStart.getDate() + index);
        const bucketEnd = new Date(bucketStart);
        bucketEnd.setDate(bucketEnd.getDate() + 1);
        return { label, start: bucketStart, end: bucketEnd };
    });
}

function createAxisLabels(maxValue) {
    const safeMax = Math.max(1, Math.ceil(maxValue));
    const step = Math.max(1, Math.ceil(safeMax / 5));
    const topValue = step * 5;
    return Array.from({ length: 6 }, (_, index) => String(topValue - step * index));
}

export function recordReviewActivity(activity) {
    const nextActivity = normalizeActivity(activity);
    const activities = readActivities();
    writeActivities([nextActivity, ...activities]);
    return nextActivity;
}

export function getReviewActivities() {
    return readActivities().sort((left, right) => safeDate(right.completedAt) - safeDate(left.completedAt));
}

export function clearReviewActivities() {
    writeActivities([]);
}

export function getRecentReviewActivities(limit = 10) {
    return getReviewActivities().slice(0, limit);
}

export function subscribeReviewActivities(listener) {
    if (!isClient()) return () => {};

    const handleUpdate = () => listener();
    window.addEventListener(REVIEW_ACTIVITY_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
        window.removeEventListener(REVIEW_ACTIVITY_EVENT, handleUpdate);
        window.removeEventListener('storage', handleUpdate);
    };
}

export function getReviewResultsStatsByPeriod(period = 'week') {
    const activities = filterByPeriod(getReviewActivities(), period)
        .filter((activity) => activity.type === 'quiz' || activity.type === 'flashcard');
    const buckets = buildResultBuckets(period);
    const bars = buckets.map((bucket) => {
        const bucketActivities = getBucketActivities(activities, bucket);
        const accuracy = getAccuracy(bucketActivities);
        return {
            label: bucket.label,
            value: accuracy.value,
            tooltip: {
                title: bucket.label,
                correct: accuracy.correct,
                incorrect: accuracy.incorrect,
            },
        };
    });
    const defaultActiveIndex = Math.max(0, bars.findLastIndex((bar) => bar.value > 0));

    return { bars, defaultActiveIndex };
}

export function getReviewSubjectStatsByPeriod(period = 'week') {
    const activities = filterByPeriod(getReviewActivities(), period);
    const groupedSubjects = new Map();

    activities.forEach((activity) => {
        const key = activity.subjectId || activity.subjectTitle;
        const current = groupedSubjects.get(key) ?? {
            name: activity.subjectTitle || 'Môn học',
            durationSeconds: 0,
            correct: 0,
            incorrect: 0,
        };

        current.durationSeconds += activity.durationSeconds || 0;
        current.correct += activity.correctCount || 0;
        current.incorrect += (activity.wrongCount || 0) + (activity.blankCount || 0);
        groupedSubjects.set(key, current);
    });

    const totalSeconds = Array.from(groupedSubjects.values()).reduce((sum, item) => sum + item.durationSeconds, 0);

    if (groupedSubjects.size === 0 || totalSeconds <= 0) {
        return {
            centerLabel: 'Tổng thời gian',
            centerValue: '0s',
            subjects: [{
                name: 'Chưa có dữ liệu',
                color: '#c4d0fb',
                share: 100,
                percent: '0%',
                time: '0s',
                correct: 0,
                incorrect: 0,
                borderColor: hexToRgba('#c4d0fb', 0.2),
                progressWidth: 0,
            }],
        };
    }

    let accumulatedShare = 0;
    const subjects = Array.from(groupedSubjects.values())
        .sort((left, right) => right.durationSeconds - left.durationSeconds)
        .slice(0, 7)
        .map((item, index, items) => {
            const isLast = index === items.length - 1;
            const share = isLast ? Math.max(1, 100 - accumulatedShare) : Math.max(1, Math.round((item.durationSeconds / totalSeconds) * 100));
            accumulatedShare += share;
            const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];

            return {
                name: item.name,
                color,
                share,
                percent: `${share}%`,
                time: formatDuration(item.durationSeconds),
                correct: item.correct,
                incorrect: item.incorrect,
                borderColor: hexToRgba(color, 0.2),
                progressWidth: Math.round((share / 100) * 344),
            };
        });

    return {
        centerLabel: 'Tổng thời gian',
        centerValue: formatDuration(totalSeconds),
        subjects,
    };
}

export function getReviewTimeStatsPeriod(period = 'day') {
    const buckets = getTimeBuckets(period);
    const activities = getReviewActivities();
    const values = buckets.map((bucket) => {
        const totalSeconds = getBucketActivities(activities, bucket)
            .reduce((sum, activity) => sum + (activity.durationSeconds || 0), 0);
        return period === 'day' ? Math.round(totalSeconds / 60) : Math.round((totalSeconds / 3600) * 10) / 10;
    });
    const maxValue = Math.max(...values, period === 'day' ? 60 : 1);
    const chartMax = Number(createAxisLabels(maxValue)[0]);
    const title = period === 'day' ? 'Thống kê thời gian ôn tập' : 'Thời gian';
    const dropdownLabels = { day: 'Ngày', week: 'Tuần', month: 'Tháng', year: 'Năm' };
    const topLegendLabels = {
        day: 'Phút /2 giờ',
        week: 'Giờ /1 ngày',
        month: 'Giờ /1 tuần',
        year: 'Giờ /1 tháng',
    };
    const bottomLegendLabels = {
        day: 'Khung giờ /1 ngày',
        week: 'Ngày /1 tuần',
        month: 'Tuần /1 tháng',
        year: 'Tháng /1 năm',
    };

    return {
        title,
        dropdownLabel: dropdownLabels[period] ?? 'Ngày',
        titleClassName: period === 'day'
            ? 'text-[20px] font-semibold leading-[1.2] text-[#212121]'
            : 'text-[18px] font-semibold leading-normal tracking-[0.2766px] text-[#243465]',
        alignItemsClassName: period === 'day' ? 'items-start' : 'items-center',
        topLegendLabel: topLegendLabels[period] ?? topLegendLabels.day,
        bottomLegendLabel: bottomLegendLabels[period] ?? bottomLegendLabels.day,
        axisLabels: createAxisLabels(maxValue),
        bars: buckets.map((bucket, index) => ({
            label: bucket.label,
            height: Math.max(2, Math.round((values[index] / chartMax) * 251)),
            width: period === 'week' ? 28 : period === 'month' ? 38 : 12,
            value: values[index],
        })),
    };
}

export { RESULT_PERIOD_OPTIONS, formatDuration };
