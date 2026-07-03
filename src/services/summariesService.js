import API_ENDPOINTS from '../config/api';
import { getStoredAuth, handleSessionExpired } from './authService';

const summaryRequests = new Map();

function getAccessToken(token) {
    if (token) return token;

    const storedAuth = getStoredAuth();
    if (storedAuth?.accessToken) return storedAuth.accessToken;

    if (typeof window === 'undefined') return null;

    return window.localStorage.getItem('access_token')
        || window.sessionStorage.getItem('access_token');
}

function resolvePayload(payload) {
    return payload?.data ?? payload;
}

function getErrorMessage(payload, fallback) {
    return payload?.message || payload?.error || fallback;
}

function createHttpError(response, payload, fallback) {
    const error = new Error(getErrorMessage(payload, fallback));
    error.status = response.status;
    error.payload = payload;
    return error;
}

async function parseJson(response) {
    return response.json().catch(() => null);
}

async function requestJson(url, { method = 'GET', token } = {}) {
    const accessToken = getAccessToken(token);
    const headers = {
        Accept: 'application/json',
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        method,
        headers,
    });

    const payload = await parseJson(response);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            handleSessionExpired();
        }

        throw createHttpError(response, payload, 'Không thể tải tóm tắt.');
    }

    return resolvePayload(payload);
}

function getArrayPayload(payload, keys) {
    const data = resolvePayload(payload);

    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
}

function getSummarySource(payload) {
    const data = resolvePayload(payload);
    return data?.summary ?? data?.documentSummary ?? data?.item ?? data;
}

function getFirstId(payload) {
    const source = getSummarySource(payload);
    return source?.id ?? source?._id ?? source?.summaryId;
}

function normalizeStringArray(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === 'string' ? item : item?.content ?? item?.text ?? item?.title ?? ''))
            .filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        return value
            .split(/\r?\n/)
            .map((item) => item.replace(/^[-*]\s*/, '').trim())
            .filter(Boolean);
    }

    return [];
}

function normalizeSections(value) {
    if (Array.isArray(value)) {
        return value
            .map((section, index) => {
                if (typeof section === 'string') {
                    return {
                        heading: `Mục ${index + 1}`,
                        content: section,
                    };
                }

                return {
                    heading: section?.heading ?? section?.title ?? section?.name ?? `Mục ${index + 1}`,
                    content: section?.content ?? section?.body ?? section?.text ?? '',
                };
            })
            .filter((section) => section.heading || section.content);
    }

    if (typeof value === 'string' && value.trim()) {
        return [{
            heading: 'Nội dung chính',
            content: value,
        }];
    }

    return [];
}

export async function generateSummary(documentId, { token } = {}) {
    return requestJson(API_ENDPOINTS.SUMMARIES.GENERATE(documentId), {
        method: 'POST',
        token,
    });
}

export async function fetchSummariesByDocument(documentId, { token } = {}) {
    const payload = await requestJson(API_ENDPOINTS.SUMMARIES.LIST(documentId), { token });
    return getArrayPayload(payload, ['items', 'summaries', 'documentSummaries', 'data']);
}

export async function fetchSummaryById(id, { token } = {}) {
    return requestJson(API_ENDPOINTS.SUMMARIES.DETAIL(id), { token });
}

export async function getOrCreateSummaryByDocument(documentId, { token } = {}) {
    const requestKey = `${documentId}:${token || 'stored-token'}`;

    if (summaryRequests.has(requestKey)) {
        return summaryRequests.get(requestKey);
    }

    const requestPromise = (async () => {
        const existingSummaries = await fetchSummariesByDocument(documentId, { token });
        const existingSummary = existingSummaries[0];
        const existingSummaryId = getFirstId(existingSummary);

        if (existingSummaryId) {
            return fetchSummaryById(existingSummaryId, { token });
        }

        if (existingSummary) {
            return existingSummary;
        }

        const generatedSummary = await generateSummary(documentId, { token });
        const generatedSummaryId = getFirstId(generatedSummary);

        if (generatedSummaryId) {
            return fetchSummaryById(generatedSummaryId, { token });
        }

        return generatedSummary;
    })();

    summaryRequests.set(requestKey, requestPromise);

    try {
        return await requestPromise;
    } finally {
        summaryRequests.delete(requestKey);
    }
}

export function normalizeSummary(rawSummary) {
    const source = getSummarySource(rawSummary);
    const sections = normalizeSections(source?.sections);
    const keyPoints = normalizeStringArray(source?.keyPoints ?? source?.key_points);
    const suggestedQuestions = normalizeStringArray(
        source?.suggestedQuestions ?? source?.suggested_questions ?? source?.questions,
    );

    return {
        id: String(getFirstId(source) ?? ''),
        title: source?.title ?? source?.summaryTitle ?? source?.name ?? 'Tóm tắt tài liệu',
        overview: source?.overview ?? source?.summary ?? source?.description ?? '',
        keyPoints,
        sections,
        suggestedQuestions,
    };
}
