import { getStoredAuth } from '../services/authService';

export const SUBJECTS_STORAGE_KEY = 'uttq.review.subjects';

function getCurrentUserKey() {
    const storedAuth = getStoredAuth();
    const user = storedAuth?.user;
    const userKey = user?.id
        ?? user?._id
        ?? user?.userId
        ?? user?.email
        ?? user?.username;

    return userKey ? String(userKey) : 'anonymous';
}

export function getSubjectsStorageKey() {
    return `${SUBJECTS_STORAGE_KEY}:${getCurrentUserKey()}`;
}

export function readJson(key, fallback) {
    if (typeof window === 'undefined') return fallback;

    try {
        const rawValue = window.localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallback;
    } catch {
        return fallback;
    }
}
