import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getSubjectsStorageKey, readJson } from '../utils/subjectsStorage';

const SubjectsContext = createContext(null);

function readStoredSubjects(storageKey = getSubjectsStorageKey()) {
    if (typeof window === 'undefined') {
        return [];
    }

    const parsedValue = readJson(storageKey, []);

    return Array.isArray(parsedValue) ? parsedValue : [];
}

export function SubjectsProvider({ children }) {
    const [storageKey, setStorageKey] = useState(getSubjectsStorageKey);
    const [subjects, setSubjects] = useState(() => readStoredSubjects(storageKey));

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(storageKey, JSON.stringify(subjects));
    }, [storageKey, subjects]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const syncStorageKey = () => {
            const nextStorageKey = getSubjectsStorageKey();

            if (nextStorageKey === storageKey) {
                return;
            }

            setStorageKey(nextStorageKey);
            setSubjects(readStoredSubjects(nextStorageKey));
        };

        window.addEventListener('focus', syncStorageKey);
        window.addEventListener('myweb:auth-updated', syncStorageKey);
        window.addEventListener('storage', syncStorageKey);

        return () => {
            window.removeEventListener('focus', syncStorageKey);
            window.removeEventListener('myweb:auth-updated', syncStorageKey);
            window.removeEventListener('storage', syncStorageKey);
        };
    }, [storageKey]);

    const addSubject = useCallback((subjectData) => {
        const newSubject = {
            id: String(subjectData.id ?? crypto.randomUUID()),
            subjectCode: subjectData.subjectCode ?? '',
            title: subjectData.title ?? '',
            description: subjectData.description ?? '',
            fileCount: subjectData.fileCount ?? 0,
            exercises: Array.isArray(subjectData.exercises) ? subjectData.exercises : [],
            isNewSubject: subjectData.isNewSubject ?? false,
            source: subjectData.source ?? 'local',
        };

        setSubjects((current) => {
            const exists = current.some((s) => s.id === newSubject.id);
            if (exists) {
                return current;
            }
            return [...current, newSubject];
        });

        return newSubject;
    }, []);

    const ensureSubject = useCallback((subjectData) => {
        if (!subjectData?.id) {
            return;
        }

        setSubjects((current) => {
            const exists = current.some((s) => s.id === subjectData.id);
            if (exists) {
                return current;
            }

            const seededSubject = {
                id: String(subjectData.id),
                subjectCode: subjectData.subjectCode ?? '',
                title: subjectData.title ?? '',
                description: subjectData.description ?? '',
                fileCount: subjectData.fileCount ?? 0,
                exercises: Array.isArray(subjectData.exercises) ? subjectData.exercises : [],
                isNewSubject: subjectData.isNewSubject ?? false,
                source: subjectData.source ?? 'local',
            };

            return [...current, seededSubject];
        });
    }, []);

    const updateSubject = useCallback((id, updates) => {
        setSubjects((current) =>
            current.map((s) => (s.id === id ? { ...s, ...updates } : s))
        );
    }, []);

    const appendExercises = useCallback((id, exercises) => {
        if (!id || !Array.isArray(exercises) || exercises.length === 0) {
            return;
        }

        setSubjects((current) =>
            current.map((s) => {
                if (String(s.id) !== String(id)) {
                    return s;
                }

                const existingExercises = Array.isArray(s.exercises) ? s.exercises : [];
                return {
                    ...s,
                    exercises: [...existingExercises, ...exercises],
                    fileCount: (s.fileCount ?? 0) + exercises.length,
                };
            })
        );
    }, []);

    const updateExercise = useCallback((subjectId, exerciseId, updates) => {
        if (!subjectId || !exerciseId) {
            return;
        }

        setSubjects((current) =>
            current.map((subject) => {
                if (String(subject.id) !== String(subjectId) || !Array.isArray(subject.exercises)) {
                    return subject;
                }

                const exercises = subject.exercises.map((exercise) => (
                    String(exercise.id) === String(exerciseId)
                        ? {
                            ...exercise,
                            ...updates,
                            progress: Math.max(exercise.progress ?? 0, updates.progress ?? 0),
                        }
                        : exercise
                ));
                const completedCount = exercises.filter((exercise) => (exercise.progress ?? 0) >= 100).length;

                return {
                    ...subject,
                    exercises,
                    completedCount,
                    unfinishedCount: Math.max(0, exercises.length - completedCount),
                };
            })
        );
    }, []);

    const deleteSubject = useCallback((id) => {
        setSubjects((current) => current.filter((s) => String(s.id) !== String(id)));
    }, []);

    const getSubjectById = useCallback(
        (id) => subjects.find((s) => String(s.id) === String(id)) ?? null,
        [subjects]
    );

    return (
        <SubjectsContext.Provider
            value={{
                subjects,
                addSubject,
                ensureSubject,
                updateSubject,
                appendExercises,
                updateExercise,
                deleteSubject,
                getSubjectById,
            }}
        >
            {children}
        </SubjectsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubjects() {
    const ctx = useContext(SubjectsContext);
    if (!ctx) {
        throw new Error('useSubjects must be used within a SubjectsProvider');
    }
    return ctx;
}

export default SubjectsContext;
