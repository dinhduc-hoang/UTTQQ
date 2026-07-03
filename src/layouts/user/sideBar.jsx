import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo2 from '../../assets/icons/logo2.svg';
import { SIDEBAR_OPTIONS, THEME_OPTIONS } from '../../constants/sideBar';
import { useTheme } from '../../contexts/ThemeContext';

const MENU_ROUTE_MAP = {
    '/': 'Thống kê',
    '/statistical': 'Thống kê',
    '/review': 'Ôn tập',
    '/account': 'Tài khoản',
    '/setting': 'Cài đặt',
};

const MENU_PATH_MAP = {
    'Thống kê': '/statistical',
    'Ôn tập': '/review',
    'Tài khoản': '/account',
    'Cài đặt': '/setting',
};

function SidebarItem({ icon: Icon, label, active, isDark, onClick }) {
    const iconNode = Icon({ color: active ? '#6949FF' : isDark ? '#F5F7FB' : '#212121' });

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`relative flex h-[50px] w-[220px] items-center overflow-hidden text-left transition-colors duration-200 cursor-pointer ${active ? 'rounded-br-[20px] rounded-tr-[20px] bg-[rgba(105,73,255,0.1)]' : 'hover:bg-[rgba(113,82,243,0.04)]'}`}
        >
            <span
                className={`absolute left-0 top-0 h-full w-[3px] rounded-r-[10px] bg-[#7152f3] transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0'}`}
            />
            <span className="relative z-10 ml-[19px] flex h-6 w-6 shrink-0 items-center justify-center transition-colors duration-200">
                {iconNode}
            </span>
            <span
                className={`relative z-10 ml-4 text-[16px] leading-6 transition-colors duration-200 ${active ? 'font-semibold text-[#6949FF]' : 'font-normal text-[#212121]'}`}
            >
                {label}
            </span>
        </button>
    );
}

function ThemeToggleItem({ icon: Icon, label, active, isDark, onClick }) {
    const iconNode = Icon({ color: active ? '#FFFFFF' : isDark ? '#F5F7FB' : '#16151C' });

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`relative z-10 flex h-full w-[110px] items-center gap-2.5 px-[18px] text-left transition-colors duration-200 ${active ? 'cursor-default' : 'cursor-pointer'}`}
        >
            {iconNode}
            <span className={`text-[16px] leading-6 transition-colors duration-200 ${active ? 'font-normal text-white' : 'font-normal text-[#16151C]'}`}>
                {label}
            </span>
        </button>
    );
}

function joinClassNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function SideBar({ className = '', onNavigate }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, isDark, setTheme } = useTheme();
    const activeThemeLabel = theme === 'dark' ? 'Tối' : 'Sáng';

    const activeMenuLabel = MENU_ROUTE_MAP[location.pathname] ?? 'Thống kê';

    const handleMenuClick = (label) => {
        navigate(MENU_PATH_MAP[label] ?? '/statistical');
        onNavigate?.();
    };

    const handleLogoClick = () => {
        navigate('/statistical');
        onNavigate?.();
    };

    return (
        <aside className={joinClassNames('app-sidebar relative h-full w-[280px] shrink-0 overflow-hidden rounded-[20px] bg-[#EDEFFF] transition-colors duration-300', className)}>
            <button
                type="button"
                onClick={handleLogoClick}
                className="absolute left-[30px] top-[31px] flex w-[140px] items-center justify-between text-left transition-opacity hover:opacity-80"
                aria-label="Chuyển đến thống kê"
            >
                <img src={Logo2} alt="UTTQ" className="h-[38px] w-[38px] shrink-0" />
                <span
                    className="text-[32px] font-bold leading-[1.2] text-[#212121]"
                    style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}
                >
                    UTTQ
                </span>
            </button>

            <div className="absolute left-[30px] top-[110px] flex flex-col gap-2.5">
                {SIDEBAR_OPTIONS.map((item) => (
                    <SidebarItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={item.label === activeMenuLabel}
                        isDark={isDark}
                        onClick={() => handleMenuClick(item.label)}
                    />
                ))}
            </div>

            <div className="absolute bottom-[30px] left-[30px]">
                <div className="relative h-[50px] w-[220px] overflow-hidden rounded-full bg-[rgba(105,73,255,0.1)]">
                    <div
                        className={`absolute left-0 top-0 h-full w-[110px] rounded-full bg-[#7152f3] transition-transform duration-300 ${activeThemeLabel === 'Tối' ? 'translate-x-full' : 'translate-x-0'}`}
                    />
                    <div className="relative flex h-full w-full items-center">
                        {THEME_OPTIONS.map((item) => (
                            <ThemeToggleItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                active={item.label === activeThemeLabel}
                                isDark={isDark}
                                onClick={() => setTheme(item.label === 'Tối' ? 'dark' : 'light')}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
