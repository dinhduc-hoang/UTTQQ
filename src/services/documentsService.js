import API_ENDPOINTS from '../config/api';
import { getStoredAuth, handleSessionExpired } from './authService';

function isClient() {
    return typeof window !== 'undefined';
}

function getAccessToken(token) {
    if (token) return token;

    const storedAuth = getStoredAuth();
    if (storedAuth?.accessToken) return storedAuth.accessToken;

    if (!isClient()) return null;

    return window.localStorage.getItem('access_token')
        || window.sessionStorage.getItem('access_token');
}

function resolvePayload(payload) {
    return payload?.data ?? payload;
}

function getDocumentsArray(payload) {
    const data = resolvePayload(payload);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.documents)) return data.documents;
    if (Array.isArray(data?.data)) return data.data;

    return [];
}

function getErrorMessage(payload, fallback) {
    return payload?.message || payload?.error || fallback;
}

async function parseJson(response) {
    return response.json().catch(() => null);
}

async function requestJson(url, { method = 'GET', token, body, headers } = {}) {
    const accessToken = getAccessToken(token);

    if (!accessToken) {
        throw new Error('Vui lòng đăng nhập!');
    }

    const response = await fetch(url, {
        method,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...headers,
        },
        body,
    });

    const payload = await parseJson(response);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            handleSessionExpired();
        }

        throw new Error(getErrorMessage(payload, 'Không thể tải dữ liệu tài liệu.'));
    }

    return resolvePayload(payload);
}

function getDocumentEndpoint(id) {
    if (typeof API_ENDPOINTS.DOCUMENTS.DETAIL === 'function') {
        return API_ENDPOINTS.DOCUMENTS.DETAIL(id);
    }

    return `${API_ENDPOINTS.DOCUMENTS.LIST}/${id}`;
}

export async function uploadDocument({ file, title, token }) {
    const accessToken = getAccessToken(token);

    if (!accessToken) {
        throw new Error('Vui lòng đăng nhập!');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (title?.trim()) {
        formData.append('title', title.trim());
    }

    const response = await fetch(API_ENDPOINTS.DOCUMENTS.UPLOAD, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    const payload = await parseJson(response);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            handleSessionExpired();
        }

        throw new Error(getErrorMessage(payload, 'Tải lên thất bại.'));
    }

    return resolvePayload(payload);
}

export async function fetchDocuments({ token } = {}) {
    const payload = await requestJson(API_ENDPOINTS.DOCUMENTS.LIST, { token });
    return getDocumentsArray(payload);
}

export async function fetchDocumentById(id, { token } = {}) {
    return requestJson(getDocumentEndpoint(id), { token });
}

export async function deleteDocument(id, { token } = {}) {
    return requestJson(getDocumentEndpoint(id), {
        method: 'DELETE',
        token,
    });
}

function formatDateLabel(value) {
    if (!value) return 'Chưa ôn tập';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString('vi-VN');
}

function getNestedArray(source, keys) {
    for (const key of keys) {
        if (Array.isArray(source?.[key])) return source[key];
    }

    return [];
}

export function normalizeDocument(document) {
    const source = document?.document ?? document?.item ?? document;
    const id = source?.id ?? source?._id ?? source?.documentId;
    const title = source?.title
        ?? source?.name
        ?? source?.fileName
        ?? source?.filename
        ?? source?.originalName
        ?? (id ? `Tài liệu ${id}` : 'Tài liệu');

    const exerciseSources = getNestedArray(source, [
        'exercises',
        'exams',
        'examSets',
        'flashcardSets',
        'trueFalseSets',
        'questions',
    ]);

    const exercises = exerciseSources.map((item, index) => ({
        id: String(item?.id ?? item?._id ?? item?.exerciseId ?? `${id || 'document'}-${index}`),
        title: item?.title ?? item?.name ?? item?.question ?? `Bài tập ${index + 1}`,
        latestAttemptedAt: formatDateLabel(item?.latestAttemptedAt ?? item?.updatedAt ?? item?.createdAt),
        progress: Number(item?.progress ?? item?.accuracy ?? item?.score ?? 0) || 0,
    }));

    const completedCount = Number(source?.completedCount ?? source?.completed ?? 0) || 0;
    const unfinishedCount = Number(source?.unfinishedCount ?? source?.unfinished ?? exercises.length) || 0;

    return {
        ...source,
        id: String(id ?? ''),
        subjectCode: String(source?.subjectCode ?? source?.code ?? id ?? ''),
        title,
        name: title,
        description: source?.description
            ?? source?.summary
            ?? source?.fileName
            ?? source?.filename
            ?? '',
        fileCount: Number(source?.fileCount ?? source?.documentsCount ?? source?.filesCount ?? 1) || 1,
        unfinishedCount,
        completedCount,
        exercises,
    };
}
