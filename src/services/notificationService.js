import { getSubjectsStorageKey } from '../utils/subjectsStorage';

const NOTIFICATIONS_STORAGE_KEY = 'uttq.notifications.v1';
const NOTIFICATION_SETTINGS_KEY = 'uttq.notification.settings.v1';
const NOTIFICATIONS_EVENT = 'uttq:notifications-updated';

const DEFAULT_NOTIFICATION_SETTINGS = {
    enabled: true,
    reminderTime: '20:00',
    browserNotifications: false,
    lastReminderDate: '',
};

function isClient() {
    return typeof window !== 'undefined';
}

function getTodayKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
}

function formatTime(date = new Date()) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function readJson(key, fallback) {
    if (!isClient()) return fallback;

    try {
        const rawValue = window.localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallback;
    } catch {
        return fallback;
    }
}

function writeJson(key, value) {
    if (!isClient()) return;
    window.localStorage.setItem(key, JSON.stringify(value));
}

function dispatchNotificationEvent() {
    if (!isClient()) return;
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT));
}

function getStoredSubjects() {
    const subjects = readJson(getSubjectsStorageKey(), []);
    return Array.isArray(subjects) ? subjects : [];
}

function normalizeProgress(value) {
    const progress = Math.round(Number(value) || 0);
    return Math.max(0, Math.min(100, progress));
}

function buildReminderTargets() {
    return getStoredSubjects().flatMap((subject) => {
        const exercises = Array.isArray(subject.exercises) ? subject.exercises : [];
        return exercises
            .map((exercise) => ({
                subjectId: String(subject.id ?? ''),
                subjectTitle: subject.title ?? subject.name ?? 'Môn học',
                exerciseId: String(exercise.id ?? ''),
                exerciseTitle: exercise.title ?? exercise.name ?? 'Bài ôn tập',
                documentId: exercise.documentId ? String(exercise.documentId) : '',
                progress: normalizeProgress(exercise.progress),
            }))
            .filter((target) => target.progress >= 50 && target.progress < 100);
    });
}

function showBrowserNotification(notification, settings) {
    if (!settings.browserNotifications || !('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const browserNotification = new Notification(notification.title, {
        body: notification.message,
        tag: notification.id,
    });

    browserNotification.onclick = () => {
        window.focus();
    };
}

export function getNotificationSettings() {
    return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...readJson(NOTIFICATION_SETTINGS_KEY, {}),
    };
}

export function saveNotificationSettings(settings) {
    const nextSettings = {
        ...getNotificationSettings(),
        ...settings,
    };
    writeJson(NOTIFICATION_SETTINGS_KEY, nextSettings);
    dispatchNotificationEvent();
    return nextSettings;
}

export async function requestBrowserNotificationPermission() {
    if (!isClient() || !('Notification' in window)) {
        return 'unsupported';
    }

    const permission = await Notification.requestPermission();
    saveNotificationSettings({
        browserNotifications: permission === 'granted',
    });
    return permission;
}

export function getNotifications() {
    const notifications = readJson(NOTIFICATIONS_STORAGE_KEY, []);
    return Array.isArray(notifications)
        ? notifications.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
        : [];
}

export function getUnreadNotificationCount() {
    return getNotifications().filter((notification) => !notification.read).length;
}

export function markNotificationRead(notificationId) {
    const notifications = getNotifications().map((notification) => (
        notification.id === notificationId ? { ...notification, read: true } : notification
    ));
    writeJson(NOTIFICATIONS_STORAGE_KEY, notifications);
    dispatchNotificationEvent();
}

export function markAllNotificationsRead() {
    const notifications = getNotifications().map((notification) => ({ ...notification, read: true }));
    writeJson(NOTIFICATIONS_STORAGE_KEY, notifications);
    dispatchNotificationEvent();
}

export function createReminderNotification(now = new Date()) {
    const settings = getNotificationSettings();
    const todayKey = getTodayKey(now);

    if (!settings.enabled || settings.lastReminderDate === todayKey) {
        return null;
    }

    const targets = buildReminderTargets();
    if (targets.length === 0) {
        saveNotificationSettings({ lastReminderDate: todayKey });
        return null;
    }

    const notification = {
        id: crypto.randomUUID(),
        type: 'study-reminder',
        title: 'Nhắc nhở hoàn thiện bài ôn tập',
        message: `Bạn có ${targets.length} bài đã làm trên 50% nhưng chưa hoàn thiện.`,
        read: false,
        createdAt: now.toISOString(),
        targets: targets.slice(0, 6),
    };
    const notifications = [notification, ...getNotifications()].slice(0, 80);

    writeJson(NOTIFICATIONS_STORAGE_KEY, notifications);
    saveNotificationSettings({ lastReminderDate: todayKey });
    showBrowserNotification(notification, settings);
    dispatchNotificationEvent();
    return notification;
}

export function checkDueReminder(now = new Date()) {
    const settings = getNotificationSettings();
    if (!settings.enabled || formatTime(now) !== settings.reminderTime) {
        return null;
    }

    return createReminderNotification(now);
}

export function subscribeNotifications(listener) {
    if (!isClient()) return () => {};

    const handleUpdate = () => listener();
    window.addEventListener(NOTIFICATIONS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
        window.removeEventListener(NOTIFICATIONS_EVENT, handleUpdate);
        window.removeEventListener('storage', handleUpdate);
    };
}

export function getReminderTargets() {
    return buildReminderTargets();
}
