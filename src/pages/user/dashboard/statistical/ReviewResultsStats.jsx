import React, { useEffect, useRef, useState } from 'react';
import {
    REVIEW_RESULTS_AXIS_LABELS,
    REVIEW_RESULTS_DEFAULT_PERIOD,
    REVIEW_RESULTS_TIME_OPTIONS,
} from '../../../../constants/reviewResultsStats';
import {
    getReviewResultsStatsByPeriod,
    subscribeReviewActivities,
} from '../../../../services/reviewActivityService';

function ChevronDownIcon() {
    return (
        <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
    );
}

function ChartLine() {
    return <div className="h-px w-full rounded-[1px] bg-[#eaeaea]" />;
}

function Tooltip({ bar, left, bottom, visible }) {
    return (
        <div
            className={`pointer-events-none absolute z-10 w-[188px] -translate-x-1/2 rounded-xl bg-white px-4 py-3 shadow-[0_4px_19px_rgba(34,34,34,0.12)] transition-all duration-300 ease-out ${visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-2'}`}
            style={{ left, bottom }}
            aria-hidden="true"
        >
            <div className="flex items-start justify-between gap-3 text-[12px] leading-none">
                <p className="font-normal text-[#6c757d]">{bar.tooltip.title}</p>
                <p className="shrink-0 font-semibold text-[#6949ff]">{bar.value}%</p>
            </div>

            <div className="my-2 h-px w-full bg-[#f2f4f8]" />

            <div className="flex items-center justify-between gap-3 text-[12px] leading-none text-[#343a40]">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#009966]" />
                    <span>Đúng</span>
                </div>
                <span className="font-semibold">{bar.tooltip.correct}</span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 text-[12px] leading-none text-[#343a40]">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ff5a5f]" />
                    <span>Sai</span>
                </div>
                <span className="font-semibold">{bar.tooltip.incorrect}</span>
            </div>

            <div className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white shadow-[0_4px_19px_rgba(34,34,34,0.12)]" />
        </div>
    );
}

export default function ReviewResultsStats() {
    const [selectedPeriod, setSelectedPeriod] = useState(REVIEW_RESULTS_DEFAULT_PERIOD);
    const [refreshToken, setRefreshToken] = useState(0);
    const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const activePeriod = getReviewResultsStatsByPeriod(selectedPeriod, refreshToken);
    const tooltipBarIndex = hoveredBarIndex ?? activePeriod.defaultActiveIndex;
    const tooltipBar = activePeriod.bars[tooltipBarIndex] ?? activePeriod.bars[0];
    const selectedPeriodLabel = REVIEW_RESULTS_TIME_OPTIONS.find((option) => option.value === selectedPeriod)?.label ?? 'Tuần này';

    useEffect(() => {
        setHoveredBarIndex(null);
    }, [activePeriod.defaultActiveIndex, selectedPeriod]);

    useEffect(() => subscribeReviewActivities(() => {
        setRefreshToken((currentToken) => currentToken + 1);
    }), []);

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

    const isTooltipVisible = hoveredBarIndex !== null;
    const tooltipLeft = `${((tooltipBarIndex + 0.5) / activePeriod.bars.length) * 100}%`;
    const tooltipBottom = `calc(${tooltipBar.value}% + 18px)`;
    const shouldAllowHorizontalScroll = activePeriod.bars.length > 6;
    const chartContentMinWidth = shouldAllowHorizontalScroll ? `${activePeriod.bars.length * 72}px` : undefined;

    return (
        <div className="h-auto min-h-[435px] w-full max-w-none rounded-[20px] bg-white px-4 pb-6 pt-4 shadow-[0_0_8px_rgba(0,0,0,0.06)] sm:h-[435px] sm:max-w-[878px] sm:px-8 sm:pb-8 sm:pt-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <h2 className="flex-1 text-[20px] font-bold leading-tight tracking-[-0.01em] text-[#343a40]">
                    Thống kê kết quả ôn tập
                </h2>

                <div ref={dropdownRef} className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((currentState) => !currentState)}
                        className="flex items-center gap-1 rounded-[10px] bg-white px-4 py-2 text-[14px] font-normal leading-tight text-[#343a40] shadow-[0_0_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]. cursor-pointer"
                    >
                        <span>{selectedPeriodLabel}</span>
                        <ChevronDownIcon />
                    </button>

                    {isDropdownOpen ? (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 overflow-hidden rounded-xl border border-[#f2f4f8] bg-white shadow-[0_8px_24px_rgba(34,34,34,0.12)]">
                            {REVIEW_RESULTS_TIME_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPeriod(option.value);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`block w-full px-4 py-3 text-left text-[14px] leading-tight transition-colors cursor-pointer hover:bg-[#f8f6ff] ${selectedPeriod === option.value ? 'font-medium text-[#6949ff]' : 'font-normal text-[#343a40]'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-5 ">
                <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-0">
                    <div className="flex h-[300px] flex-col justify-between py-px pr-2 text-right text-[12px] font-semibold leading-none text-[#6c757d]">
                        {REVIEW_RESULTS_AXIS_LABELS.map((label) => (
                            <p key={label} className="leading-[normal]">
                                {label}
                            </p>
                        ))}
                    </div>

                    <div className={`relative h-[300px] rounded-xs ${shouldAllowHorizontalScroll ? 'overflow-x-auto overflow-y-visible' : 'overflow-visible'}`}>
                        <div className="relative h-full w-full" style={chartContentMinWidth ? { minWidth: chartContentMinWidth } : undefined}>
                            <div className="absolute inset-x-0 top-0 bottom-9 flex flex-col justify-between py-px">
                                {REVIEW_RESULTS_AXIS_LABELS.map((label) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <ChartLine />
                                    </div>
                                ))}
                            </div>

                            <div className="absolute inset-x-0 top-0 bottom-9 flex items-end justify-between px-2">
                                {activePeriod.bars.map((bar, index) => {
                                    const isHovered = hoveredBarIndex === index;
                                    const hasHoveredBar = hoveredBarIndex !== null;
                                    const shouldUseDarkTone = !hasHoveredBar || isHovered;
                                    const barHeight = `${bar.value}%`;

                                    return (
                                        <button
                                            key={`${selectedPeriod}-${index}`}
                                            type="button"
                                            onMouseEnter={() => setHoveredBarIndex(index)}
                                            onMouseLeave={() => setHoveredBarIndex(null)}
                                            onFocus={() => setHoveredBarIndex(index)}
                                            onBlur={() => setHoveredBarIndex(null)}
                                            className="relative flex h-full flex-1 items-end justify-center cursor-pointer outline-none"
                                        >
                                            <div
                                                className={`w-4 rounded-[5px] transition-all duration-300 ease-out ${shouldUseDarkTone ? 'bg-[#9787ff]' : 'bg-[rgba(151,135,255,0.5)]'}`}
                                                style={{ height: barHeight }}
                                            />
                                        </button>
                                    );
                                })}

                                <Tooltip bar={tooltipBar} bottom={tooltipBottom} left={tooltipLeft} visible={isTooltipVisible} />
                            </div>

                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-1">
                                {activePeriod.bars.map((bar, index) => (
                                    <p
                                        key={`${selectedPeriod}-label-${index}`}
                                        className="flex-1 text-center text-[12px] font-normal leading-[normal] text-[#6c757d]"
                                    >
                                        {bar.label}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="h-[19px] w-[150px]" />

                    <div className="flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full bg-[#9787ff]" />
                        <span className="text-[10px] font-semibold leading-tight text-[#5f666c]">Tên môn</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
