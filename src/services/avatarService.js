import API_ENDPOINTS from '../config/api';
import { getStoredAuth, handleSessionExpired, updateStoredAuthUser } from './authService';

const AVATAR_STORAGE_KEY = 'uttq.user.avatars.v1';
const AVATAR_EVENT = 'uttq:avatar-updated';
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

function isClient() {
    return typeof window !== 'undefined';
}

function getUserAvatarKey(user) {
    return String(user?.id ?? user?.email ?? 'guest');
}

function readAvatarMap() {
    if (!isClient()) return {};

    try {
        const rawValue = window.localStorage.getItem(AVATAR_STORAGE_KEY);
        const parsedValue = rawValue ? JSON.parse(rawValue) : {};
        return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
    } catch {
        return {};
    }
}

function writeAvatarMap(avatarMap) {
    if (!isClient()) return;

    window.localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatarMap));
    notifyAvatarChange();
}

function notifyAvatarChange() {
    if (!isClient()) return;

    window.dispatchEvent(new CustomEvent(AVATAR_EVENT));
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Không đọc được ảnh avatar.'));
        reader.readAsDataURL(file);
    });
}

export function getSavedAvatar(user) {
    const storedAuth = getStoredAuth();
    const storedUser = storedAuth?.user;

    if (storedUser?.avatarUrl && (!user?.id || storedUser.id === user.id)) {
        return storedUser.avatarUrl;
    }

    if (user?.avatarUrl) {
        return user.avatarUrl;
    }

    const avatarMap = readAvatarMap();
    return avatarMap[getUserAvatarKey(user)] ?? '';
}

function resolveApiPayload(payload) {
    return payload?.data ?? payload;
}

async function updateBackendAvatar(avatarUrl) {
    const storedAuth = getStoredAuth();
    const accessToken = storedAuth?.accessToken;

    if (!accessToken) {
        throw new Error('Bạn cần đăng nhập để lưu avatar.');
    }

    const response = await fetch(API_ENDPOINTS.AUTH.AVATAR, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ avatarUrl }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            handleSessionExpired();
        }

        throw new Error(payload?.message || payload?.error || 'Không thể lưu avatar lên máy chủ.');
    }

    return resolveApiPayload(payload);
}

export async function saveAvatarFile(user, file) {
    if (!file) {
        throw new Error('Vui lòng chọn ảnh avatar.');
    }

    if (!file.type?.startsWith('image/')) {
        throw new Error('Avatar phải là file ảnh.');
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
        throw new Error('Ảnh avatar tối đa 5MB.');
    }

    const avatarDataUrl = await readFileAsDataUrl(file);
    const updatedUser = await updateBackendAvatar(avatarDataUrl);
    updateStoredAuthUser({ avatarUrl: updatedUser.avatarUrl });
    notifyAvatarChange();
    return updatedUser.avatarUrl;
}

export async function removeSavedAvatar(user) {
    const updatedUser = await updateBackendAvatar(null);
    updateStoredAuthUser({ avatarUrl: updatedUser.avatarUrl });
    const avatarMap = readAvatarMap();
    delete avatarMap[getUserAvatarKey(user)];
    writeAvatarMap(avatarMap);
    return updatedUser.avatarUrl;
}

export function subscribeAvatarChanges(listener) {
    if (!isClient()) return () => {};

    const handleUpdate = () => listener();
    window.addEventListener(AVATAR_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
        window.removeEventListener(AVATAR_EVENT, handleUpdate);
        window.removeEventListener('storage', handleUpdate);
    };
}
