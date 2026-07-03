import API_ENDPOINTS from '../config/api';
import { getStoredAuth, handleSessionExpired } from './authService';

const trueFalseRequests = new Map();

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
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            handleSessionExpired();
        }

        throw new Error(getErrorMessage(payload, 'Không thể tải câu đúng/sai.'));
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

export async function generateTrueFalseQuestions(documentId, { token } = {}) {
    return requestJson(API_ENDPOINTS.TRUE_FALSE.GENERATE(documentId), {
        method: 'POST',
        token,
    });
}

export async function fetchTrueFalseQuestionsByDocument(documentId, { token } = {}) {
    const payload = await requestJson(API_ENDPOINTS.TRUE_FALSE.LIST(documentId), { token });
    return getArrayPayload(payload, ['items', 'questions', 'trueFalseQuestions', 'data']);
}

export async function getOrCreateTrueFalseQuestionsByDocument(documentId, { token } = {}) {
    const requestKey = `${documentId}:${token || 'stored-token'}`;

    if (trueFalseRequests.has(requestKey)) {
        return trueFalseRequests.get(requestKey);
    }

    const requestPromise = (async () => {
        const existingQuestions = await fetchTrueFalseQuestionsByDocument(documentId, { token });

        if (existingQuestions.length > 0) {
            return existingQuestions;
        }

        const generatedQuestions = await generateTrueFalseQuestions(documentId, { token });
        const normalizedGeneratedQuestions = getArrayPayload(generatedQuestions, ['items', 'questions', 'trueFalseQuestions', 'data']);

        if (normalizedGeneratedQuestions.length > 0) {
            return normalizedGeneratedQuestions;
        }

        const refreshedQuestions = await fetchTrueFalseQuestionsByDocument(documentId, { token });

        if (refreshedQuestions.length > 0) {
            return refreshedQuestions;
        }

        throw new Error('Backend chưa sinh được câu đúng/sai.');
    })();

    trueFalseRequests.set(requestKey, requestPromise);

    try {
        return await requestPromise;
    } finally {
        trueFalseRequests.delete(requestKey);
    }
}

function normalizeBoolean(value) {
    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
        const normalizedValue = value.toLowerCase().trim();

        if (normalizedValue === 'true') return true;
        if (normalizedValue === 'false') return false;
    }

    return true;
}

export function normalizeTrueFalseQuestions(rawQuestions) {
    return getArrayPayload(rawQuestions, ['items', 'questions', 'trueFalseQuestions', 'data'])
        .map((question, index) => ({
            id: String(question?.id ?? question?._id ?? index + 1),
            badge: `Câu ${question?.questionNumber ?? index + 1}`,
            prompt: question?.content ?? question?.question ?? question?.prompt ?? '',
            explanation: question?.explanation ?? '',
            isDefinitionCorrect: normalizeBoolean(
                question?.correctAnswer ?? question?.isCorrect ?? question?.answer,
            ),
        }))
        .filter((question) => question.prompt);
}
