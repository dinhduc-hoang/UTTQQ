import React, { useEffect, useRef, useState } from 'react';
import {
    getReviewTimeStatsPeriod,
    subscribeReviewActivities,
} from '../../../../services/reviewActivityService';

function ChevronDownIcon({ className = 'h-4 w-4' }) {
    return (
        <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
    );
}

const DROPDOWN_BUTTON_CLASSNAME =
    'flex cursor-pointer items-center gap-1 rounded-[10px] bg-white px-4 py-2 text-[14px] font-normal leading-tight text-[#343a40] shadow-[0_0_16px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:shadow-[0_0_18px_rgba(0,0,0,0.1)]';

const DROPDOWN_ICON_CLASSNAME = 'h-4 w-4';

const REVIEW_TIME_PERIODS = {
    day: {
        title: 'Thống kê thời gian ôn tập',
        dropdownLabel: 'Ngày',
        titleClassName: 'text-[20px] font-semibold leading-[1.2] text-[#212121]',
        buttonClassName: DROPDOWN_BUTTON_CLASSNAME,
        buttonIconClassName: DROPDOWN_ICON_CLASSNAME,
        alignItemsClassName: 'items-start',
        topLegendLabel: 'Phút /1 giờ',
        bottomLegendLabel: 'Giờ /1 ngày',
        axisLabels: ['60', '50', '40', '30', '20', '10', '0'],
        bars: [
            { label: '1', height: 88, width: 8 },
            { label: '2', height: 18, width: 8 },
            { label: '3', height: 38, width: 8 },
            { label: '4', height: 77, width: 8 },
            { label: '5', height: 2, width: 8 },
            { label: '6', height: 3, width: 8 },
            { label: '7', height: 11, width: 8 },
            { label: '8', height: 127, width: 8 },
            { label: '9', height: 162, width: 8 },
            { label: '10', height: 219, width: 13 },
            { label: '11', height: 251, width: 12 },
            { label: '12', height: 210, width: 13 },
        ],
    },
    week: {
        title: 'Thời gian',
        dropdownLabel: 'Tuần',
        titleClassName: 'text-[18px] font-semibold leading-normal tracking-[0.2766px] text-[#243465]',
        buttonClassName: DROPDOWN_BUTTON_CLASSNAME,
        buttonIconClassName: DROPDOWN_ICON_CLASSNAME,
        alignItemsClassName: 'items-center',
        topLegendLabel: 'Giờ /1 ngày',
        bottomLegendLabel: 'Ngày /1 tuần',
        axisLabels: ['24', '20', '16', '12', '8', '4', '0'],
        bars: [
            { label: 'T2', height: 88, width: 28 },
            { label: 'T3', height: 18, width: 28 },
            { label: 'T4', height: 38, width: 28 },
            { label: 'T5', height: 77, width: 28 },
            { label: 'T6', height: 2, width: 28 },
            { label: 'T7', height: 3, width: 28 },
            { label: 'CN', height: 11, width: 28 },
        ],
    },
    month: {
        title: 'Thời gian',
        dropdownLabel: 'Tháng',
        titleClassName: 'text-[18px] font-semibold leading-normal tracking-[0.2766px] text-[#243465]',
        buttonClassName: DROPDOWN_BUTTON_CLASSNAME,
        buttonIconClassName: DROPDOWN_ICON_CLASSNAME,
        alignItemsClassName: 'items-center',
        topLegendLabel: '% thời gian/ 1 tuần',
        bottomLegendLabel: 'Tuần /1 tháng',
        axisLabels: ['100', '80', '60', '40', '20', '0'],
        bars: [
            { label: 'Tuần 1', height: 88, width: 37 },
            { label: 'Tuần 2', height: 18, width: 38 },
            { label: 'Tuần 3', height: 38, width: 38 },
            { label: 'Tuần 4', height: 162, width: 38 },
        ],
    },
    year: {
        title: 'Thời gian',
        dropdownLabel: 'Năm',
        titleClassName: 'text-[18px] font-semibold leading-normal tracking-[0.2766px] text-[#243465]',
        buttonClassName: DROPDOWN_BUTTON_CLASSNAME,
        buttonIconClassName: DROPDOWN_ICON_CLASSNAME,
        alignItemsClassName: 'items-center',
        topLegendLabel: '% thời gian /1 tháng',
        bottomLegendLabel: 'Tháng /1 năm',
        axisLabels: ['100', '80', '60', '40', '20', '0'],
        bars: [
            { label: '1', height: 88, width: 8 },
            { label: '2', height: 18, width: 8 },
            { label: '3', height: 38, width: 8 },
            { label: '4', height: 77, width: 8 },
            { label: '5', height: 2, width: 8 },
            { label: '6', height: 3, width: 8 },
            { label: '7', height: 11, width: 8 },
            { label: '8', height: 127, width: 8 },
            { label: '9', height: 162, width: 8 },
            { label: '10', height: 219, width: 13 },
            { label: '11', height: 251, width: 12 },
            { label: '12', height: 210, width: 13 },
        ],
    },
};

const REVIEW_TIME_PERIOD_OPTIONS = Object.entries(REVIEW_TIME_PERIODS).map(([value, config]) => ({
    label: config.dropdownLabel,
    value,
}));

function ChartRows({ labels }) {
    return (
        <div className="absolute inset-x-0 top-0 flex h-[278px] flex-col justify-between w-full max-w-[844px]">
            {labels.map((label) => (
                <div key={label} className="flex items-center">
                    <span className="w-[42px] shrink-0 pr-2 text-right text-[14px] font-medium leading-[1.4] text-[#9e9e9e]">{label}</span>
                    <div className="h-px flex-1 border-t border-dashed border-[#eaeaea]" />
                </div>
            ))}
        </div>
    );
}

function ChartBars({ bars }) {
    return (
        <div className="absolute left-[42px] top-3.5 flex h-[277px] items-end justify-between w-full max-w-[720px]">
            {bars.map((bar) => (
                <div key={bar.label} className="flex shrink-0 flex-col items-center justify-end gap-2" style={{ width: `${bar.width}px` }}>
                    <div className="rounded-lg bg-[#c4d0fb]" style={{ height: `${bar.height}px`, width: `${bar.width}px` }} />
                    <p className="w-full text-center text-[12px] font-normal leading-normal text-[rgba(158,158,158,0.7)]">{bar.label}</p>
                </div>
            ))}
        </div>
    );
}

export default function ReviewTimeStats() {
    const [selectedPeriod, setSelectedPeriod] = useState('day');
    const [refreshToken, setRefreshToken] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const activePeriod = getReviewTimeStatsPeriod(selectedPeriod, refreshToken);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!dropdownRef.current?.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, []);

    useEffect(() => subscribeReviewActivities(() => {
        setRefreshToken((currentToken) => currentToken + 1);
    }), []);

    return (
        <div
            className={`justify-self-start flex h-auto min-h-[427px] w-full max-w-none flex-col justify-between overflow-visible rounded-[20px] bg-white px-4 py-6 shadow-[-1px_1px_14.9px_9px_rgba(0,0,0,0.03)] sm:max-w-[878px] sm:px-[17px] sm:py-[27px] ${activePeriod.alignItemsClassName}`}
        // style={{ width: `${TIME_STATS_CARD_WIDTH}px` }}
        >
            <div className="flex min-h-8 w-full max-w-[844px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className={activePeriod.titleClassName}>{activePeriod.title}</h2>

                <div ref={dropdownRef} className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((currentState) => !currentState)}
                        className={activePeriod.buttonClassName}
                    >
                        <span className="whitespace-nowrap">{activePeriod.dropdownLabel}</span>
                        <ChevronDownIcon className={activePeriod.buttonIconClassName} />
                    </button>

                    {isDropdownOpen ? (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 overflow-hidden rounded-xl border border-[#f2f4f8] bg-white shadow-[0_8px_24px_rgba(34,34,34,0.12)]">
                            {REVIEW_TIME_PERIOD_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPeriod(option.value);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`block w-full cursor-pointer px-4 py-3 text-left text-[14px] leading-tight transition-colors hover:bg-[#f8f6ff] ${selectedPeriod === option.value ? 'font-medium text-[#6949ff]' : 'font-normal text-[#343a40]'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="flex items-center w-full max-w-[844px]">
                <div className="flex items-center gap-[7px]">
                    <span className="h-3 w-3 shrink-0 rounded-full bg-[#6a5ae0]" />
                    <p className="text-[12px] font-normal leading-normal text-[#848a9c]">{activePeriod.topLegendLabel}</p>
                </div>
            </div>

            <div className="relative h-[301px] w-full max-w-[844px]">
                <ChartRows labels={activePeriod.axisLabels} />
                <ChartBars bars={activePeriod.bars} />
            </div>

            <div className="flex items-center justify-end w-full max-w-[844px]">
                <div className="flex items-center gap-[7px]">
                    <span className="h-3 w-3 shrink-0 rounded-full bg-[#c4d0fb]" />
                    <p className="text-[12px] font-normal leading-normal text-[#848a9c]">{activePeriod.bottomLegendLabel}</p>
                </div>
            </div>
        </div>
    );
}
