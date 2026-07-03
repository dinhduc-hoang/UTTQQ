import API_ENDPOINTS from '../config/api';
import { getStoredAuth, handleSessionExpired } from './authService';

const examRequests = new Map();

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

async function parseJson(response) {
    return response.json().catch(() => null);
}

async function requestJson(url, { method = 'GET', token } = {}) {
    const accessToken = getAccessToken(token);

    if (!accessToken) {
        throw new Error('Vui lòng đăng nhập!');
    }

    const response = await fetch(url, {
        method,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const payload = await parseJson(response);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            handleSessionExpired();
        }

        throw new Error(getErrorMessage(payload, 'Không thể tải đề trắc nghiệm.'));
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

function getFirstId(payload) {
    const data = resolvePayload(payload);
    const source = data?.exam ?? data?.item ?? data;

    return source?.id ?? source?._id ?? source?.examId;
}

export async function generateExam(documentId, { token } = {}) {
    return requestJson(API_ENDPOINTS.EXAMS.GENERATE(documentId), {
        method: 'POST',
        token,
    });
}

export async function fetchExamsByDocument(documentId, { token } = {}) {
    const payload = await requestJson(API_ENDPOINTS.EXAMS.LIST(documentId), { token });
    return getArrayPayload(payload, ['items', 'exams', 'data']);
}

export async function fetchExamById(id, { token } = {}) {
    return requestJson(API_ENDPOINTS.EXAMS.DETAIL(id), { token });
}

export async function getOrCreateExamByDocument(documentId, { token } = {}) {
    const requestKey = `${documentId}:${token || 'stored-token'}`;

    if (examRequests.has(requestKey)) {
        return examRequests.get(requestKey);
    }

    const requestPromise = (async () => {
        const existingExams = await fetchExamsByDocument(documentId, { token });
        const existingExam = existingExams.find((exam) => exam?.status === 'completed');
        const existingExamId = getFirstId(existingExam);

        if (existingExamId) {
            const existingExamDetail = await fetchExamById(existingExamId, { token });
            const existingQuestions = normalizeExam(existingExamDetail).questions;

            if (existingQuestions.length > 0) {
                return existingExamDetail;
            }
        }

        const generatedExam = await generateExam(documentId, { token });
        const generatedExamId = getFirstId(generatedExam);

        if (generatedExamId) {
            return fetchExamById(generatedExamId, { token });
        }

        return generatedExam;
    })();

    examRequests.set(requestKey, requestPromise);

    try {
        return await requestPromise;
    } finally {
        examRequests.delete(requestKey);
    }
}

function getQuestionText(question) {
    return question?.prompt
        ?? question?.content
        ?? question?.text
        ?? question?.question
        ?? question?.questionText
        ?? '';
}

function getOptionText(option) {
    return typeof option === 'string'
        ? option
        : option?.text ?? option?.content ?? option?.answer ?? option?.label ?? '';
}

function getQuestionOptions(question) {
    if (Array.isArray(question?.options)) {
        return question.options.map(getOptionText).filter(Boolean);
    }

    if (Array.isArray(question?.answers)) {
        return question.answers.map(getOptionText).filter(Boolean);
    }

    if (Array.isArray(question?.choices)) {
        return question.choices.map(getOptionText).filter(Boolean);
    }

    return [
        question?.optionA ?? question?.a,
        question?.optionB ?? question?.b,
        question?.optionC ?? question?.c,
        question?.optionD ?? question?.d,
    ].filter(Boolean);
}

function getCorrectOptionIndex(question, options) {
    const rawAnswer = question?.correctOptionIndex
        ?? question?.correctIndex
        ?? question?.correctAnswerIndex;

    if (Number.isInteger(rawAnswer)) return rawAnswer;

    const correctAnswer = question?.correctAnswer
        ?? question?.answer
        ?? question?.correctOption
        ?? question?.correct;

    if (typeof correctAnswer === 'number') return correctAnswer;

    if (typeof correctAnswer !== 'string') return -1;

    const normalizedAnswer = correctAnswer.trim();
    const letterIndex = ['A', 'B', 'C', 'D'].indexOf(normalizedAnswer.toUpperCase());

    if (letterIndex >= 0) return letterIndex;

    return options.findIndex((option) => option.trim() === normalizedAnswer);
}

export function normalizeExam(rawExam) {
    const source = rawExam?.exam ?? rawExam?.item ?? rawExam;
    const rawQuestions = getArrayPayload(source, ['questions', 'items']);

    const questions = rawQuestions
        .map((question, index) => {
            const options = getQuestionOptions(question);

            return {
                id: String(question?.id ?? question?._id ?? question?.questionId ?? index + 1),
                prompt: getQuestionText(question),
                options,
                correctOptionIndex: getCorrectOptionIndex(question, options),
            };
        })
        .filter((question) => question.prompt && question.options.length > 0);

    return {
        id: String(getFirstId(source) ?? ''),
        title: source?.title ?? source?.name ?? 'Đề trắc nghiệm',
        questions,
    };
}
