import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationIcon from '../../assets/icons/notification.svg';
import AvatarIcon from '../../assets/imgs/Avatars.svg';
import AvatarDropdown from '../../components/AvatarDropdown';
import { USER_PROFILE } from '../../constants/userProfile';
import useAuth from '../../hooks/useAuth';
import useAvatar from '../../hooks/useAvatar';
import {
    checkDueReminder,
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsRead,
    markNotificationRead,
    subscribeNotifications,
} from '../../services/notificationService';
import { searchReviewContent } from '../../services/searchService';

function SearchIcon({ color }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 10.25C1.5 15.0825 5.41751 19 10.25 19C15.0825 19 19 15.0825 19 10.25C19 5.41751 15.0825 1.5 10.25 1.5C5.41751 1.5 1.5 5.41751 1.5 10.25ZM10.25 20.5C4.58908 20.5 0 15.9109 0 10.25C0 4.58908 4.58908 0 10.25 0C15.9109 0 20.5 4.58908 20.5 10.25C20.5 12.8105 19.5611 15.1517 18.0089 16.9482L21.2803 20.2197C21.5732 20.5126 21.5732 20.9874 21.2803 21.2803C20.9874 21.5732 20.5126 21.5732 20.2197 21.2803L16.9482 18.0089C15.1517 19.5611 12.8105 20.5 10.25 20.5Z" fill={color} />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function getGreetingPeriod(hour) {
    return hour < 12 ? 'sáng' : 'tối';
}

export default function TopBar({ onMenuClick }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const searchRef = useRef(null);
    const notificationRef = useRef(null);
    const { avatarSrc } = useAvatar(user, AvatarIcon);
    const [greetingPeriod, setGreetingPeriod] = useState(() => getGreetingPeriod(new Date().getHours()));
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notificationRefreshToken, setNotificationRefreshToken] = useState(0);

    useEffect(() => {
        const updateGreetingPeriod = () => {
            setGreetingPeriod(getGreetingPeriod(new Date().getHours()));
        };

        updateGreetingPeriod();
        const intervalId = window.setInterval(updateGreetingPeriod, 60_000);

        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const runReminderCheck = () => checkDueReminder();

        runReminderCheck();
        const intervalId = window.setInterval(runReminderCheck, 60_000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => subscribeNotifications(() => {
        setNotificationRefreshToken((currentToken) => currentToken + 1);
    }), []);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!searchRef.current?.contains(event.target)) {
                setIsSearchFocused(false);
            }

            if (!notificationRef.current?.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, []);

    const hasSearchText = searchQuery.trim() !== '';
    const searchIconColor = hasSearchText ? '#212121' : isSearchFocused ? '#6A5AE0' : '#16151C';
    const searchInputClassName = hasSearchText ? 'text-[#212121] font-normal' : 'text-[#99A1AF] font-light';

    const displayName = user?.fullName ?? USER_PROFILE.displayName;
    const searchResults = useMemo(() => searchReviewContent(searchQuery), [searchQuery]);
    const notifications = useMemo(() => getNotifications().slice(0, 8), [notificationRefreshToken]);
    const unreadCount = useMemo(() => getUnreadNotificationCount(), [notificationRefreshToken]);

    const handleSearchResultClick = (result) => {
        setSearchQuery('');
        setIsSearchFocused(false);
        navigate(result.path, result.state ? { state: result.state } : undefined);
    };

    const handleNotificationClick = (notification) => {
        markNotificationRead(notification.id);
        const firstTarget = notification.targets?.[0];
        setIsNotificationOpen(false);

        if (firstTarget?.subjectId && firstTarget?.exerciseId) {
            navigate(`/review/${firstTarget.subjectId}/choose-method/${firstTarget.exerciseId}`);
        }
    };

    return (
        <div className="flex w-full flex-col gap-3 py-2 sm:gap-4 sm:py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    aria-label="Mở menu"
                    onClick={onMenuClick}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(162,161,168,0.1)] text-[#212121] transition-colors hover:bg-[rgba(162,161,168,0.2)] lg:hidden"
                >
                    <MenuIcon />
                </button>

                <div className="min-w-0">
                    <p className="truncate text-[18px] font-semibold leading-[1.2] text-[#212121] sm:text-[20px]">
                        Xin chào {displayName}
                    </p>
                    <p className="mt-1 truncate text-[13px] font-normal leading-5 text-[#99A1AF]">
                        Xin chào buổi {greetingPeriod}
                    </p>
                </div>
            </div>

            <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 lg:flex lg:w-auto lg:justify-end">
                <div ref={searchRef} className="relative min-w-0 lg:w-[261px]">
                    <label
                        className={`flex h-[46px] w-full min-w-0 items-center gap-3 rounded-[10px] border-[1.5px] px-4 transition-colors duration-200 ${isSearchFocused ? 'border-[#6A5AE0] bg-[rgba(106,90,224,0.08)]' : 'border-[rgba(162,161,168,0.1)] bg-white'}`}
                    >
                        <SearchIcon color={searchIconColor} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            type="search"
                            placeholder="Tìm kiếm"
                            aria-label="Tìm kiếm"
                            onFocus={() => setIsSearchFocused(true)}
                            className={`h-full w-full min-w-0 bg-transparent text-[15px] leading-6 outline-none placeholder:text-[#99A1AF] ${searchInputClassName}`}
                        />
                    </label>
                    {isSearchFocused && hasSearchText ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-[80] overflow-hidden rounded-2xl border border-[#efeefc] bg-white shadow-[0_20px_60px_rgba(17,12,46,0.16)] sm:left-auto sm:w-[360px] sm:max-w-[calc(100vw-40px)]">
                            {searchResults.length === 0 ? (
                                <div className="px-4 py-5 text-[14px] text-[#858494]">
                                    Không tìm thấy kết quả phù hợp.
                                </div>
                            ) : searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => handleSearchResultClick(result)}
                                    className="block w-full border-b border-[#F3F4F6] px-4 py-3 text-left last:border-b-0 hover:bg-[#f8f6ff]"
                                >
                                    <span className="block text-[12px] font-semibold text-[#7152f3]">{result.type}</span>
                                    <span className="mt-1 block truncate text-[14px] font-semibold text-[#212121]">{result.title}</span>
                                    <span className="mt-0.5 block truncate text-[12px] text-[#858494]">{result.description}</span>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div ref={notificationRef} className="relative">
                    <button
                        type="button"
                        aria-label="Thông báo"
                        aria-expanded={isNotificationOpen}
                        onClick={() => {
                            setIsNotificationOpen((currentState) => !currentState);
                            if (!isNotificationOpen) markAllNotificationsRead();
                        }}
                        className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[rgba(162,161,168,0.1)] hover:bg-[rgba(162,161,168,0.2)] cursor-pointer"
                    >
                        <img src={NotificationIcon} alt="Thông báo" />
                        {unreadCount > 0 ? (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[11px] font-semibold text-white">
                                {Math.min(9, unreadCount)}
                            </span>
                        ) : null}
                    </button>

                    {isNotificationOpen ? (
                        <div className="fixed left-4 right-4 top-[138px] z-[80] overflow-hidden rounded-2xl border border-[#efeefc] bg-white shadow-[0_20px_60px_rgba(17,12,46,0.16)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[380px]">
                            <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
                                <div>
                                    <p className="text-[15px] font-semibold text-[#212121]">Thông báo</p>
                                    <p className="mt-0.5 text-[12px] text-[#858494]">Nhắc bạn hoàn thiện bài đang dở.</p>
                                </div>
                            </div>

                            <div className="max-h-[380px] overflow-y-auto thin-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-[14px] text-[#858494]">
                                        Chưa có thông báo nào.
                                    </div>
                                ) : notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        onClick={() => handleNotificationClick(notification)}
                                        className="block w-full border-b border-[#F3F4F6] px-4 py-4 text-left last:border-b-0 hover:bg-[#f8f6ff]"
                                    >
                                        <span className="block text-[14px] font-semibold text-[#212121]">{notification.title}</span>
                                        <span className="mt-1 block text-[13px] leading-5 text-[#858494]">{notification.message}</span>
                                        {notification.targets?.length > 0 ? (
                                            <span className="mt-2 block text-[12px] font-medium text-[#7152f3]">
                                                {notification.targets[0].exerciseTitle} · {notification.targets[0].progress}%
                                            </span>
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                <AvatarDropdown
                    avatarSrc={avatarSrc}
                    displayName={displayName}
                    email={user?.email ?? 'user@example.com'}
                />
            </div>
        </div>
    );
}
