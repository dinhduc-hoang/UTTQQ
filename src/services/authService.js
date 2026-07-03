import API_ENDPOINTS from '../config/api';

const AUTH_STORAGE_KEY = 'myweb.auth';
const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
const SESSION_EXPIRED_REDIRECT = '/landing';

function isClient() {
	return typeof window !== 'undefined';
}

function readAuthFromStorage(storage) {
	try {
		const rawValue = storage.getItem(AUTH_STORAGE_KEY);

		return rawValue ? JSON.parse(rawValue) : null;
	} catch {
		return null;
	}
}

function writeAuthToStorage(storage, auth) {
	storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function clearAuthFromStorage(storage) {
	storage.removeItem(AUTH_STORAGE_KEY);
}

function resolveApiPayload(payload) {
	return payload?.data ?? payload;
}

function decodeBase64Url(value) {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

	return window.atob(paddedBase64);
}

function getJwtPayload(token) {
	if (!isClient() || typeof token !== 'string') {
		return null;
	}

	const [, payload] = token.split('.');

	if (!payload) {
		return null;
	}

	try {
		return JSON.parse(decodeBase64Url(payload));
	} catch {
		return null;
	}
}

export function isAccessTokenExpired(token) {
	const payload = getJwtPayload(token);

	if (!payload?.exp) {
		return false;
	}

	return Date.now() >= payload.exp * 1000;
}

export function handleSessionExpired(message = SESSION_EXPIRED_MESSAGE) {
	if (!isClient()) {
		return;
	}

	clearStoredAuth();

	if (window.__mywebSessionExpiredHandled) {
		return;
	}

	window.__mywebSessionExpiredHandled = true;
	window.dispatchEvent(new CustomEvent('myweb:session-expired'));
	window.alert(message);

	if (window.location.pathname !== SESSION_EXPIRED_REDIRECT) {
		window.location.replace(SESSION_EXPIRED_REDIRECT);
	}
}

function normalizeAuthPayload(payload) {
	const authPayload = resolveApiPayload(payload);

	if (!authPayload?.accessToken || !authPayload?.refreshToken || !authPayload?.user) {
		throw new Error('Phản hồi xác thực không hợp lệ.');
	}

	return {
		accessToken: authPayload.accessToken,
		refreshToken: authPayload.refreshToken,
		user: authPayload.user,
	};
}

export function getStoredAuth() {
	if (!isClient()) {
		return null;
	}

	const storedAuth = readAuthFromStorage(window.localStorage) ?? readAuthFromStorage(window.sessionStorage);

	if (storedAuth?.accessToken && isAccessTokenExpired(storedAuth.accessToken)) {
		handleSessionExpired();
		return null;
	}

	return storedAuth;
}

export function saveStoredAuth(auth, rememberMe = false) {
	if (!isClient()) {
		return;
	}

	window.__mywebSessionExpiredHandled = false;
	clearStoredAuth();

	const storage = rememberMe ? window.localStorage : window.sessionStorage;
	writeAuthToStorage(storage, auth);
	window.dispatchEvent(new CustomEvent('myweb:auth-updated', { detail: auth }));
}

export function clearStoredAuth() {
	if (!isClient()) {
		return;
	}

	clearAuthFromStorage(window.localStorage);
	clearAuthFromStorage(window.sessionStorage);
}

export function updateStoredAuthUser(updates) {
	if (!isClient()) {
		return null;
	}

	const localAuth = readAuthFromStorage(window.localStorage);
	const sessionAuth = readAuthFromStorage(window.sessionStorage);
	const storage = localAuth ? window.localStorage : sessionAuth ? window.sessionStorage : null;
	const currentAuth = localAuth ?? sessionAuth;

	if (!storage || !currentAuth?.user) {
		return null;
	}

	const nextAuth = {
		...currentAuth,
		user: {
			...currentAuth.user,
			...updates,
		},
	};

	writeAuthToStorage(storage, nextAuth);
	window.dispatchEvent(new CustomEvent('myweb:auth-updated', { detail: nextAuth }));
	return nextAuth;
}

export async function login(credentials, { rememberMe = false } = {}) {
	const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(credentials),
	});

	const payload = await response.json().catch(() => null);

	if (!response.ok) {
		clearStoredAuth();
		throw new Error(payload?.message || payload?.error || 'Đăng nhập thất bại.');
	}

	try {
		const auth = normalizeAuthPayload(payload);
		saveStoredAuth(auth, rememberMe);
		return auth;
	} catch (error) {
		clearStoredAuth();
		throw error;
	}
}

export async function register(payload) {
	const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(payload),
	});

	const responsePayload = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(responsePayload?.message || responsePayload?.error || 'Đăng ký thất bại.');
	}

	return resolveApiPayload(responsePayload) ?? {
		message: 'Đăng ký thành công',
	};
}

export async function logout() {
	const storedAuth = getStoredAuth();
	const accessToken = storedAuth?.accessToken;

	clearStoredAuth();

	if (!accessToken) {
		return {
			message: 'Đăng xuất thành công',
		};
	}

	const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const payload = await response.json().catch(() => null);

	if (!response.ok) {
		if (response.status === 401 || response.status === 403) {
			handleSessionExpired();
		}

		throw new Error(payload?.message || payload?.error || 'Đăng xuất thất bại.');
	}

	return resolveApiPayload(payload) ?? {
		message: 'Đăng xuất thành công',
	};
}
