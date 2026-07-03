import { getSubjectsStorageKey } from '../utils/subjectsStorage';

const REVIEW_ACTIVITY_STORAGE_KEY = 'uttq.review.activities.v1';

function readJson(key, fallback) {
    if (typeof window === 'undefined') return fallback;

    try {
        const rawValue = window.localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallback;
    } catch {
        return fallback;
    }
}

function normalizeSearchText(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function includesQuery(...values) {
    return (query) => values.some((value) => normalizeSearchText(value).includes(query));
}

function getSubjects() {
    const subjects = readJson(getSubjectsStorageKey(), []);
    return Array.isArray(subjects) ? subjects : [];
}

function getActivities() {
    const activities = readJson(REVIEW_ACTIVITY_STORAGE_KEY, []);
    return Array.isArray(activities) ? activities : [];
}

function buildExercisePath(subjectId, exerciseId) {
    return `/review/${subjectId}/choose-method/${exerciseId}`;
}

export function searchReviewContent(rawQuery, limit = 8) {
    const query = normalizeSearchText(rawQuery);
    if (!query) return [];

    const subjects = getSubjects();
    const staticRoutes = [
        { id: 'route-statistical', type: 'Trang', title: 'Thống kê', description: 'Dashboard kết quả, môn học và thời gian ôn tập', path: '/statistical' },
        { id: 'route-review', type: 'Trang', title: 'Ôn tập', description: 'Danh sách môn học và bài ôn tập', path: '/review' },
        { id: 'route-recent', type: 'Trang', title: 'Đã ôn tập gần đây', description: 'Lịch sử các phiên ôn tập', path: '/review/recent' },
        { id: 'route-account', type: 'Trang', title: 'Tài khoản', description: 'Thông tin cá nhân và giờ thông báo', path: '/account' },
        { id: 'route-setting', type: 'Trang', title: 'Cài đặt', description: 'Theme sáng tối và tùy chọn hệ thống', path: '/setting' },
    ];
    const results = staticRoutes.filter((route) => includesQuery(route.title, route.description)(query));

    subjects.forEach((subject) => {
        const subjectTitle = subject.title ?? subject.name ?? 'Môn học';
        const subjectMatcher = includesQuery(subjectTitle, subject.subjectCode, subject.description);

        if (subjectMatcher(query)) {
            results.push({
                id: `subject-${subject.id}`,
                type: 'Môn học',
                title: subjectTitle,
                description: subject.subjectCode || `${subject.exercises?.length ?? 0} bài ôn tập`,
                path: `/review/${subject.id}`,
                state: subject,
            });
        }

        const exercises = Array.isArray(subject.exercises) ? subject.exercises : [];
        exercises.forEach((exercise) => {
            const exerciseTitle = exercise.title ?? exercise.name ?? 'Bài ôn tập';
            const exerciseMatcher = includesQuery(exerciseTitle, subjectTitle, subject.subjectCode);

            if (!exerciseMatcher(query)) return;

            results.push({
                id: `exercise-${subject.id}-${exercise.id}`,
                type: 'Bài ôn tập',
                title: exerciseTitle,
                description: `${subjectTitle} · ${exercise.progress ?? 0}%`,
                path: buildExercisePath(subject.id, exercise.id),
                state: {
                    subject,
                    exercise,
                },
            });
        });
    });

    getActivities().forEach((activity) => {
        const activityMatcher = includesQuery(activity.exerciseTitle, activity.subjectTitle, activity.type);
        if (!activityMatcher(query)) return;

        results.push({
            id: `activity-${activity.id}`,
            type: 'Lịch sử ôn tập',
            title: activity.exerciseTitle,
            description: `${activity.subjectTitle} · ${activity.progress ?? 0}%`,
            path: buildExercisePath(activity.subjectId, activity.exerciseId),
            state: {
                subject: {
                    id: activity.subjectId,
                    title: activity.subjectTitle,
                    name: activity.subjectTitle,
                    subjectCode: activity.subjectCode,
                    exercises: [{
                        id: activity.exerciseId,
                        title: activity.exerciseTitle,
                        documentId: activity.documentId,
                        progress: activity.progress,
                    }],
                },
                exercise: {
                    id: activity.exerciseId,
                    title: activity.exerciseTitle,
                    documentId: activity.documentId,
                    progress: activity.progress,
                },
            },
        });
    });

    return results.slice(0, limit);
}
