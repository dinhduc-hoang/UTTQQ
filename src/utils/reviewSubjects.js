import {
    DEFAULT_DESCRIPTION,
    EXERCISE_TEMPLATES,
    SUBJECT_NAMES,
} from '../constants/reviewSubjects';

export function createReviewExercises() {
    return EXERCISE_TEMPLATES.map((exercise) => ({
        id: exercise.id,
        title: exercise.titleSuffix,
        latestAttemptedAt: exercise.latestAttemptedAt,
        progress: exercise.progress,
    }));
}

export function createReviewSubject({
    id,
    name,
    documents = '3 tài liệu đã tải',
    subjectCode = 'MTA02',
    description = DEFAULT_DESCRIPTION,
    unfinishedCount = 20,
    completedCount = 120,
}) {
    return {
        id: String(id),
        name,
        documents,
        subjectCode,
        description,
        unfinishedCount,
        completedCount,
        exercises: createReviewExercises(),
    };
}

export const REVIEW_SUBJECTS = Array.from({ length: 24 }, (_, index) => {
    const subjectName = `${SUBJECT_NAMES[index % SUBJECT_NAMES.length]} ${index + 1}`;

    return createReviewSubject({
        id: index + 1,
        name: subjectName,
        documents: `${(index % 5) + 1} tài liệu đã tải`,
        subjectCode: `MTA${String(index + 2).padStart(2, '0')}`,
    });
});

export function getReviewSubjectById(subjectId) {
    return REVIEW_SUBJECTS.find((subject) => subject.id === String(subjectId));
}