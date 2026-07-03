import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo2 from '../../../assets/icons/logo2.svg';
import RegisterIcon from '../../../assets/icons/registerIcon.svg';
import ProfileIcon from '../../../assets/icons/Profile.svg';

const NAV_ITEMS = [
    { label: 'Giải pháp', targetId: 'solution-section' },
    { label: 'Tính năng', targetId: 'features-section' },
    { label: 'Số liệu', targetId: 'stats-section' },
    { label: 'Về chúng tôi', targetId: 'about-section' },
];

const SECTION_IDS = NAV_ITEMS.map((item) => item.targetId);

function scrollToSection(targetId) {
    const targetElement = document.getElementById(targetId);

    targetElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
}

export default function Header() {
    const headerRef = useRef(null);
    const [activeSection, setActiveSection] = useState('solution-section');
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const updateActiveSection = () => {
            const headerHeight = headerRef.current?.offsetHeight ?? 0;
            const scrollPosition = window.scrollY + headerHeight + 16;

            let currentSection = 'solution-section';

            SECTION_IDS.forEach((sectionId) => {
                const sectionElement = document.getElementById(sectionId);

                if (!sectionElement) {
                    return;
                }

                if (sectionElement.offsetTop <= scrollPosition) {
                    currentSection = sectionId;
                }
            });

            setActiveSection(currentSection);
            setShowScrollTop(window.scrollY > 420);
        };

        updateActiveSection();
        window.addEventListener('scroll', updateActiveSection, { passive: true });
        window.addEventListener('resize', updateActiveSection);

        return () => {
            window.removeEventListener('scroll', updateActiveSection);
            window.removeEventListener('resize', updateActiveSection);
        };
    }, []);

    return (
        <>
            <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 w-full bg-white px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.06)] sm:px-6 lg:px-[100px] lg:py-2.5">
                <div className="mx-auto flex w-full max-w-[1920px] items-center gap-3 py-2 md:gap-8">
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="flex shrink-0 items-center gap-2.5 text-left transition-opacity hover:opacity-80 md:gap-3"
                        aria-label="Chuyển lên đầu trang"
                    >
                        <img src={Logo2} alt="UTTQ" className="h-10 w-auto md:h-[50px]" />
                        <span
                            className="text-[24px] font-semibold leading-[1.2] text-[#212121] md:text-[32px]"
                            style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}
                        >
                            UTTQ
                        </span>
                    </button>

                    <nav className="hidden flex-1 items-center justify-center gap-12 text-[20px] font-normal tracking-[0.2px] md:flex">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => scrollToSection(item.targetId)}
                                className={`cursor-pointer transition-colors hover:text-[#212121] ${activeSection === item.targetId ? 'text-[#212121]' : 'text-[#616161]'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
                        <Link
                            to="/onboard"
                            className="flex h-10 w-[82px] items-center justify-center gap-1.5 rounded-full bg-[#EDEFFF] px-2 text-[12px] font-semibold text-[#6949FF] transition-colors hover:bg-[#e8ebfe] md:h-[50px] md:w-[138px] md:gap-2.5 md:px-4 md:text-[16px]"
                        >
                            <img src={RegisterIcon} alt="" className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
                            <span>Đăng ký</span>
                        </Link>

                        <Link
                            to="/login"
                            className="flex h-10 w-[94px] items-center justify-center gap-1.5 rounded-full bg-[#6949FF] px-2 text-[12px] font-normal text-white shadow-[4px_8px_24px_0_rgba(77,93,250,0.25)] transition-transform hover:scale-[1.02] md:h-[50px] md:w-[155px] md:gap-2.5 md:px-4 md:text-[16px]"
                        >
                            <img src={ProfileIcon} alt="" className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
                            <span>Đăng nhập</span>
                        </Link>
                    </div>
                </div>
            </header>

            {showScrollTop ? (
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 rounded-full bg-[#6949FF] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_34px_rgba(105,73,255,0.32)] transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#6949FF]/30 focus:ring-offset-2"
                    aria-label="Chuyển lên đầu trang"
                >
                    Lên đầu
                </button>
            ) : null}
        </>
    );
}
