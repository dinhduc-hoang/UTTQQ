import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SideBar from './sideBar';
import TopBar from './topBar';
import { ThemeProvider } from '../../contexts/ThemeContext';

export default function MainLayout({ children }) {
    const content = children ?? <Outlet />;
    const location = useLocation();
    const navigate = useNavigate();
    const [loginToast, setLoginToast] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!location.state?.loginSuccess) return;

        setLoginToast({
            displayName: location.state.displayName || 'bạn',
        });

        navigate(location.pathname, {
            replace: true,
            state: null,
        });
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        if (!loginToast) return undefined;

        const timerId = window.setTimeout(() => {
            setLoginToast(null);
        }, 3500);

        return () => window.clearTimeout(timerId);
    }, [loginToast]);

    return (
        <ThemeProvider>
            <div className="app-shell flex h-[100dvh] w-full overflow-hidden bg-white p-3 transition-colors duration-300 sm:p-5 lg:gap-5">
                {loginToast ? (
                    <div className="fixed left-4 right-4 top-4 z-[120] rounded-[20px] border border-[#dcd7ff] bg-white px-5 py-4 shadow-[0_20px_60px_rgba(17,12,46,0.18)] sm:left-auto sm:right-6 sm:top-6 sm:w-[360px]">
                        <p className="text-[15px] font-semibold text-[#212121]">Đăng nhập thành công</p>
                        <p className="mt-1 text-[14px] leading-5 text-[#858494]">
                            Xin chào {loginToast.displayName}
                        </p>
                    </div>
                ) : null}

                <div className="hidden h-full lg:block">
                    <SideBar />
                </div>

                {isSidebarOpen ? (
                    <div className="fixed inset-0 z-[110] lg:hidden" role="dialog" aria-modal="true">
                        <button
                            type="button"
                            aria-label="Đóng menu"
                            className="absolute inset-0 bg-[#0f1220]/45 backdrop-blur-[2px]"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <div className="absolute bottom-0 left-0 top-0 w-[280px] max-w-[86vw]">
                            <SideBar
                                className="rounded-l-none rounded-r-[24px] shadow-[24px_0_80px_rgba(17,12,46,0.24)]"
                                onNavigate={() => setIsSidebarOpen(false)}
                            />
                        </div>
                    </div>
                ) : null}

                <div className="flex min-w-0 flex-1 flex-col lg:px-2">
                    <div className="flex h-full w-full min-w-0 flex-col gap-3 rounded-lg sm:gap-5">
                        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
                        <div className="thin-scrollbar min-h-0 flex-1 overflow-auto">
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
