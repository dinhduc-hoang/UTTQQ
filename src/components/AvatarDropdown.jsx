import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

function AccountIcon({ className }) {
    return (
        <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10 10.5C12.0711 10.5 13.75 8.82107 13.75 6.75C13.75 4.67893 12.0711 3 10 3C7.92893 3 6.25 4.67893 6.25 6.75C6.25 8.82107 7.92893 10.5 10 10.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3 17C4.70465 14.7215 7.20761 13.5 10 13.5C12.7924 13.5 15.2953 14.7215 17 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function SettingsIcon({ className }) {
    return (
        <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M8.75 2.5H11.25L11.7 4.3C11.85 4.84 12.28 5.25 12.82 5.37L14.6 5.8L15.85 7.95L14.52 9.08C14.1 9.44 13.94 10.02 14.12 10.53L14.62 12.15L12.95 13.82L11.33 13.32C10.82 13.14 10.24 13.3 9.88 13.72L8.75 15.05L6.6 13.8L7.03 12.02C7.15 11.48 6.74 11.05 6.2 10.9L4.4 10.45V7.95L6.2 7.5C6.74 7.35 7.15 6.92 7.03 6.38L6.6 4.6L8.75 3.35L9.88 4.68C10.24 5.1 10.82 5.26 11.33 5.08L12.95 4.58"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

function ProjectsIcon({ className }) {
    return (
        <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M4 5.5C4 4.67157 4.67157 4 5.5 4H9.5C10.3284 4 11 4.67157 11 5.5V14.5C11 15.3284 10.3284 16 9.5 16H5.5C4.67157 16 4 15.3284 4 14.5V5.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M12.5 7H14.5C15.3284 7 16 7.67157 16 8.5V14.5C16 15.3284 15.3284 16 14.5 16H12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M6.5 7.5H8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M6.5 10H8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function LogoutIcon({ className }) {
    return (
        <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M7.5 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M12 12.5L15 10L12 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15 10H7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function MenuItem({ icon: Icon, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            role="menuitem"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] font-medium text-[#3f3f46] transition-colors duration-200 hover:bg-[#f4f1ff] hover:text-[#6A5AE0] dark:text-[#cfd3e0] dark:hover:bg-[#2a2146]"
        >
            <Icon className="h-4 w-4 text-[#6A5AE0]/80 transition-colors duration-200 group-hover:text-[#6A5AE0] dark:text-[#b6b0ff]" />
            <span>{label}</span>
        </button>
    );
}

export default function AvatarDropdown({
    avatarSrc,
    avatarAlt = 'Tài khoản',
    displayName = 'Hiền Trang',
    email = 'hientrang@example.com',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!dropdownRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const dropdownAnimation = isOpen
        ? 'translate-y-0 scale-100 opacity-100'
        : 'pointer-events-none translate-y-2 scale-95 opacity-0';

    const handleNavigate = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    const handleLogout = async () => {
        setIsOpen(false);
        try {
            await logout();
        } catch (error) {
            console.error('Đăng xuất thất bại:', error);
        } finally {
            navigate('/landing');
        }
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                aria-label="Tài khoản"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((currentState) => !currentState)}
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0px_1px_3px_rgba(0,0,0,0.06)] transition duration-200 hover:ring-2 hover:ring-[#6A5AE0]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A5AE0]/40 cursor-pointer"
            >
                <img src={avatarSrc} alt={avatarAlt} className="h-full w-full object-cover" />
            </button>

            <div
                role="menu"
                aria-label="Menu tài khoản"
                className={`fixed left-4 right-4 top-[138px] z-[70] origin-top-right overflow-hidden rounded-2xl border border-[#efeef5] bg-white shadow-[0_20px_60px_rgba(17,12,46,0.15)] transition-all duration-200 ease-out dark:border-[#2a2146] dark:bg-[#1c1533] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-64 ${dropdownAnimation}`}
            >
                <div className="flex items-center gap-3 px-4 pb-3 pt-4">
                    <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-[#6A5AE0]/20">
                        <img src={avatarSrc} alt={avatarAlt} className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <p className="text-[15px] font-semibold text-[#1f1f29] dark:text-white">
                            {displayName}
                        </p>
                        <p className="text-[12px] font-normal text-[#8b8b99] dark:text-[#b3aec9]">
                            {email}
                        </p>
                    </div>
                </div>

                <div className="px-2 pb-3">
                    <MenuItem icon={AccountIcon} label="Tài khoản" onClick={() => handleNavigate('/account')} />
                    <MenuItem icon={SettingsIcon} label="Cài đặt" onClick={() => handleNavigate('/setting')} />
                    <MenuItem icon={ProjectsIcon} label="Ôn tập" onClick={() => handleNavigate('/review')} />
                </div>

                <div className="border-t border-[#f0eef6] px-2 py-3 dark:border-[#2a2146]">
                    <button
                        type="button"
                        onClick={handleLogout}
                        role="menuitem"
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-[#ef6b6b] transition-colors duration-200 hover:bg-[#ef4444] hover:text-white"
                    >
                        <LogoutIcon className="h-4 w-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
