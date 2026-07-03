import React, { useEffect, useMemo, useState } from 'react';
import { clearReviewActivities } from '../../../services/reviewActivityService';
import { useTheme } from '../../../contexts/ThemeContext';

const SETTINGS_STORAGE_KEY = 'uttq.settings';

const DEFAULT_SETTINGS = {
    compactMode: false,
    generateBeforeReview: true,
    showStudyTimer: true,
};

function readStoredSettings() {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    try {
        const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        return rawValue ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawValue) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function SettingSwitch({ title, description, checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            aria-pressed={checked}
            className="flex w-full items-center justify-between gap-5 rounded-2xl border border-[#efeefc] bg-white px-5 py-4 text-left shadow-[0_8px_22px_rgba(17,24,39,0.03)] transition-colors hover:bg-[#f8f6ff]"
        >
            <span>
                <span className="block text-[15px] font-semibold text-[#212121]">{title}</span>
                <span className="mt-1 block text-[13px] leading-5 text-[#858494]">{description}</span>
            </span>
            <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#7152f3]' : 'bg-[#d7d8e2]'}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </span>
        </button>
    );
}

function ThemeCard({ label, description, active, onClick, previewClassName, activeClassName, inactiveClassName }) {
    const cardClassName = active
        ? activeClassName
        : inactiveClassName ?? 'border-[#efeefc] bg-white hover:bg-[#f8f6ff]';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`flex min-h-[132px] flex-1 flex-col justify-between rounded-2xl border px-5 py-4 text-left transition-all ${cardClassName}`}
        >
            <span>
                <span className={`block text-[16px] font-semibold ${active ? 'text-current' : 'text-[#212121]'}`}>{label}</span>
                <span className={`mt-1 block text-[13px] leading-5 ${active ? 'text-current opacity-75' : 'text-[#858494]'}`}>{description}</span>
            </span>

            <span className={`mt-4 flex h-9 w-full items-center gap-2 rounded-xl px-3 ${previewClassName}`}>
                <span className="h-4 w-4 rounded-full bg-[#7152f3]" />
                <span className="h-2 flex-1 rounded-full bg-current opacity-30" />
                <span className="h-2 w-10 rounded-full bg-current opacity-20" />
            </span>
        </button>
    );
}

export default function Setting() {
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState(readStoredSettings);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const activeThemeLabel = theme === 'dark' ? 'Tối' : 'Sáng';
    const settingItems = useMemo(() => ([
        {
            key: 'generateBeforeReview',
            title: 'Tự sinh nội dung ôn tập',
            description: 'Khi mở tóm tắt, trắc nghiệm hoặc flashcard, hệ thống tự gọi API nếu chưa có dữ liệu.',
        },
        {
            key: 'showStudyTimer',
            title: 'Hiển thị đồng hồ ôn tập',
            description: 'Ghi lại thời gian ôn tập để cập nhật thống kê sau mỗi phiên.',
        },
        {
            key: 'compactMode',
            title: 'Giao diện gọn',
            description: 'Ưu tiên mật độ thông tin cao hơn cho các danh sách và dashboard.',
        },
    ]), []);

    const updateSetting = (key, value) => {
        setSettings((currentSettings) => ({
            ...currentSettings,
            [key]: value,
        }));
        setStatusMessage('Đã lưu cài đặt.');
    };

    const handleClearProgress = () => {
        clearReviewActivities();
        setStatusMessage('Đã xóa lịch sử ôn tập cục bộ.');
    };

    return (
        <div className="thin-scrollbar flex h-full w-full flex-col overflow-auto rounded-[20px] border border-[#E5E7EB] bg-white px-4 py-5 shadow-[0_0_8px_rgba(0,0,0,0.05)] sm:px-8 sm:py-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                    <h1 className="text-[24px] font-semibold leading-tight text-[#212121] sm:text-[28px]">Cài đặt</h1>
                    <p className="mt-2 text-[14px] leading-6 text-[#858494]">
                        Điều chỉnh giao diện và hành vi ôn tập. Theme hiện tại: <span className="font-semibold text-[#7152f3]">{activeThemeLabel}</span>.
                    </p>
                </div>

                {statusMessage ? (
                    <div className="rounded-xl bg-[#ecfdf5] px-4 py-3 text-[13px] font-medium text-[#067647]" role="status">
                        {statusMessage}
                    </div>
                ) : null}
            </div>

            <section className="mt-8">
                <h2 className="text-[18px] font-semibold text-[#212121]">Giao diện</h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <ThemeCard
                        label="Sáng"
                        description="Nền trắng, tương phản nhẹ, phù hợp làm việc ban ngày."
                        active={theme === 'light'}
                        onClick={() => setTheme('light')}
                        previewClassName="bg-white text-[#212121] ring-1 ring-[#efeefc]"
                        activeClassName="border-[#7152f3] bg-[#f4f1ff] text-[#212121] shadow-[0_12px_30px_rgba(113,82,243,0.14)]"
                    />
                    <ThemeCard
                        label="Tối"
                        description="Nền tối giảm chói, giữ accent tím cho các thao tác chính."
                        active={theme === 'dark'}
                        onClick={() => setTheme('dark')}
                        previewClassName="bg-[#171a2b] text-white ring-1 ring-[#2a3047]"
                        activeClassName="border-[#7152f3] bg-[#171a2b] text-white shadow-[0_12px_30px_rgba(113,82,243,0.22)]"
                    />
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-[18px] font-semibold text-[#212121]">Ôn tập</h2>
                <div className="mt-4 grid gap-3">
                    {settingItems.map((item) => (
                        <SettingSwitch
                            key={item.key}
                            title={item.title}
                            description={item.description}
                            checked={Boolean(settings[item.key])}
                            onChange={(value) => updateSetting(item.key, value)}
                        />
                    ))}
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-[#fee4e2] bg-[#fff7f7] px-5 py-5">
                <h2 className="text-[18px] font-semibold text-[#b42318]">Dữ liệu cục bộ</h2>
                <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#7a271a]">
                    Lịch sử ôn tập và thống kê đang được lưu trên trình duyệt này. Xóa dữ liệu sẽ đưa dashboard thống kê về trạng thái trống.
                </p>
                <button
                    type="button"
                    onClick={handleClearProgress}
                    className="mt-4 rounded-full bg-[#ef4444] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(239,68,68,0.2)] transition-colors hover:bg-[#dc2626]"
                >
                    Xóa lịch sử ôn tập
                </button>
            </section>
        </div>
    );
}
