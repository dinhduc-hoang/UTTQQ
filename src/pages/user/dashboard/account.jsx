import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarIcon from '../../../assets/imgs/Avatars.svg';
import useAuth from '../../../hooks/useAuth';
import useAvatar from '../../../hooks/useAvatar';
import {
    formatDuration,
    getReviewActivities,
} from '../../../services/reviewActivityService';
import {
    getNotificationSettings,
    getReminderTargets,
    requestBrowserNotificationPermission,
    saveNotificationSettings,
} from '../../../services/notificationService';

function StatCard({ label, value, tone = 'default' }) {
    const toneClassName = tone === 'primary'
        ? 'bg-[#7152f3] text-white'
        : tone === 'success'
            ? 'bg-[#ecfdf5] text-[#067647]'
            : 'bg-[#f7f7ff] text-[#212121]';

    return (
        <div className={`rounded-2xl px-5 py-4 ${toneClassName}`}>
            <p className="text-[13px] font-medium opacity-75">{label}</p>
            <p className="mt-2 text-[28px] font-semibold leading-none">{value}</p>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] py-4 last:border-b-0">
            <span className="text-[14px] text-[#858494]">{label}</span>
            <span className="text-right text-[14px] font-medium text-[#212121]">{value || '-'}</span>
        </div>
    );
}

export default function Account() {
    const navigate = useNavigate();
    const { user, logout, loading, error } = useAuth();
    const avatarInputRef = useRef(null);
    const { avatarSrc, saveAvatar, removeAvatar } = useAvatar(user, AvatarIcon);
    const activities = useMemo(() => getReviewActivities(), []);
    const [notificationSettings, setNotificationSettings] = useState(getNotificationSettings);
    const [notificationStatus, setNotificationStatus] = useState('');
    const [reminderTargets, setReminderTargets] = useState(() => getReminderTargets());
    const [avatarStatus, setAvatarStatus] = useState('');

    useEffect(() => {
        setReminderTargets(getReminderTargets());
    }, []);

    const totalSeconds = activities.reduce((sum, activity) => sum + (activity.durationSeconds || 0), 0);
    const quizActivities = activities.filter((activity) => activity.type === 'quiz' || activity.type === 'flashcard');
    const totalCorrect = quizActivities.reduce((sum, activity) => sum + (activity.correctCount || 0), 0);
    const totalAnswered = quizActivities.reduce((sum, activity) => sum + (activity.correctCount || 0) + (activity.wrongCount || 0) + (activity.blankCount || 0), 0);
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const displayName = user?.fullName ?? 'Người dùng UTTQ';
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/landing', { replace: true });
        } catch {
            // Error is shown below.
        }
    };

    const updateNotificationSetting = (updates) => {
        const nextSettings = saveNotificationSettings(updates);
        setNotificationSettings(nextSettings);
        setNotificationStatus('Đã lưu giờ thông báo.');
        setReminderTargets(getReminderTargets());
    };

    const handleBrowserNotificationPermission = async () => {
        const permission = await requestBrowserNotificationPermission();
        setNotificationSettings(getNotificationSettings());

        if (permission === 'granted') {
            setNotificationStatus('Đã bật thông báo trình duyệt.');
        } else if (permission === 'unsupported') {
            setNotificationStatus('Trình duyệt hiện không hỗ trợ thông báo hệ thống.');
        } else {
            setNotificationStatus('Bạn chưa cấp quyền thông báo trình duyệt.');
        }
    };

    const handleAvatarChange = async (event) => {
        const selectedFile = event.target.files?.[0];
        event.target.value = '';

        if (!selectedFile) return;

        try {
            await saveAvatar(selectedFile);
            setAvatarStatus('Đã lưu avatar.');
        } catch (avatarError) {
            setAvatarStatus(avatarError instanceof Error ? avatarError.message : 'Không thể lưu avatar.');
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            await removeAvatar();
            setAvatarStatus('Đã khôi phục avatar mặc định.');
        } catch (avatarError) {
            setAvatarStatus(avatarError instanceof Error ? avatarError.message : 'Không thể xóa avatar.');
        }
    };

    return (
        <div className="thin-scrollbar flex h-full w-full flex-col overflow-auto rounded-[20px] border border-[#E5E7EB] bg-white px-4 py-5 shadow-[0_0_8px_rgba(0,0,0,0.05)] sm:px-8 sm:py-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-[24px] bg-[#f7f7ff] px-7 py-7">
                    <div className="flex flex-wrap items-center gap-5">
                        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white">
                            <img src={avatarSrc} alt="Avatar tài khoản" className="h-full w-full object-cover" />
                            {avatarSrc === AvatarIcon ? (
                                <span className="absolute inset-0 flex items-center justify-center bg-[#7152f3]/10 text-[22px] font-semibold text-[#7152f3]">
                                    {initials}
                                </span>
                            ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-medium text-[#7152f3]">Tài khoản học tập</p>
                            <h1 className="mt-1 truncate text-[30px] font-semibold leading-tight text-[#212121]">
                                {displayName}
                            </h1>
                            <p className="mt-2 text-[14px] text-[#858494]">
                                {user?.email ?? 'Chưa có email'}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="rounded-full bg-[#7152f3] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#5f45d8]"
                                >
                                    Thay avatar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="rounded-full border border-[#ddd8ff] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#7152f3] transition-colors hover:bg-[#f2efff]"
                                >
                                    Xóa ảnh
                                </button>
                                {avatarStatus ? (
                                    <span className="text-[13px] font-medium text-[#067647]">
                                        {avatarStatus}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <StatCard label="Phiên ôn tập" value={activities.length} tone="primary" />
                        <StatCard label="Thời gian" value={formatDuration(totalSeconds)} />
                        <StatCard label="Độ chính xác" value={`${accuracy}%`} tone="success" />
                    </div>
                </section>

                <aside className="rounded-[24px] border border-[#efeefc] bg-white px-6 py-6">
                    <h2 className="text-[18px] font-semibold text-[#212121]">Thông tin</h2>
                    <div className="mt-3">
                        <DetailRow label="Họ tên" value={displayName} />
                        <DetailRow label="Email" value={user?.email} />
                        <DetailRow label="Vai trò" value={user?.role ?? 'user'} />
                        <DetailRow label="Mã tài khoản" value={user?.id} />
                    </div>
                </aside>
            </div>

            <section className="mt-6 rounded-[24px] border border-[#efeefc] bg-white px-6 py-6">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-[18px] font-semibold text-[#212121]">Thông báo ôn tập</h2>
                        <p className="mt-2 text-[14px] leading-6 text-[#858494]">
                            Mỗi ngày đúng giờ đã đặt, hệ thống sẽ nhắc những bài có tiến độ từ 50% đến dưới 100% để bạn hoàn thiện.
                        </p>
                    </div>

                    {notificationStatus ? (
                        <div className="rounded-xl bg-[#ecfdf5] px-4 py-3 text-[13px] font-medium text-[#067647]">
                            {notificationStatus}
                        </div>
                    ) : null}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
                    <label className="block rounded-2xl bg-[#f7f7ff] px-5 py-4">
                        <span className="block text-[13px] font-medium text-[#858494]">Giờ nhắc nhở</span>
                        <input
                            type="time"
                            value={notificationSettings.reminderTime}
                            onChange={(event) => updateNotificationSetting({ reminderTime: event.target.value })}
                            className="mt-3 h-11 w-full rounded-xl border border-[#efeefc] bg-white px-3 text-[16px] font-semibold text-[#212121] outline-none focus:border-[#7152f3]"
                        />
                    </label>

                    <div className="rounded-2xl bg-[#f7f7ff] px-5 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[15px] font-semibold text-[#212121]">Bật nhắc nhở hàng ngày</p>
                                <p className="mt-1 text-[13px] leading-5 text-[#858494]">
                                    Notification vẫn hiển thị trong app khi bạn đang mở trang.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => updateNotificationSetting({ enabled: !notificationSettings.enabled })}
                                className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7152f3]/30 focus:ring-offset-2 ${notificationSettings.enabled ? 'bg-[#7152f3]' : 'bg-[#d7d8e2]'}`}
                                aria-pressed={notificationSettings.enabled}
                                aria-label="Bật nhắc nhở hàng ngày"
                            >
                                <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${notificationSettings.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleBrowserNotificationPermission}
                        className="rounded-2xl bg-[#7152f3] px-5 py-4 text-left text-white shadow-[0_12px_28px_rgba(113,82,243,0.24)] transition-colors hover:bg-[#5f45d8]"
                    >
                        <span className="block text-[15px] font-semibold">Thông báo trình duyệt</span>
                        <span className="mt-1 block text-[13px] leading-5 text-white/75">
                            {notificationSettings.browserNotifications ? 'Đã bật quyền hệ thống' : 'Bật quyền nếu muốn nhận ngoài app'}
                        </span>
                    </button>
                </div>

                <div className="mt-5 rounded-2xl border border-[#efeefc] px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-[15px] font-semibold text-[#212121]">
                            Bài sẽ được nhắc hôm nay
                        </p>
                        <span className="rounded-full bg-[#edeafe] px-3 py-1 text-[12px] font-semibold text-[#7152f3]">
                            {reminderTargets.length} bài
                        </span>
                    </div>

                    <div className="mt-3 grid gap-2">
                        {reminderTargets.length === 0 ? (
                            <p className="text-[13px] text-[#858494]">
                                Chưa có bài nào ở trạng thái trên 50% và chưa hoàn thiện.
                            </p>
                        ) : reminderTargets.slice(0, 5).map((target) => (
                            <div key={`${target.subjectId}-${target.exerciseId}`} className="flex items-center justify-between gap-4 rounded-xl bg-[#f7f7ff] px-4 py-3">
                                <div className="min-w-0">
                                    <p className="truncate text-[14px] font-semibold text-[#212121]">{target.exerciseTitle}</p>
                                    <p className="mt-0.5 truncate text-[12px] text-[#858494]">{target.subjectTitle}</p>
                                </div>
                                <span className="shrink-0 text-[13px] font-semibold text-[#7152f3]">{target.progress}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-[24px] border border-[#efeefc] bg-white px-6 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-[18px] font-semibold text-[#212121]">Bảo mật phiên đăng nhập</h2>
                        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#858494]">
                            Đăng xuất sẽ xóa token đăng nhập khỏi trình duyệt này. Dữ liệu ôn tập cục bộ vẫn được giữ để thống kê.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loading}
                        className="rounded-full bg-[#ef4444] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_12px_26px_rgba(239,68,68,0.24)] transition-colors hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                </div>

                {error ? (
                    <p className="mt-4 rounded-xl bg-[#fef2f2] px-4 py-3 text-[13px] text-[#b42318]">
                        {error}
                    </p>
                ) : null}
            </section>
        </div>
    );
}
