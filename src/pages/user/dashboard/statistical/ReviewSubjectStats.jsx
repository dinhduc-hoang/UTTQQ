import React, { useEffect, useRef, useState } from 'react';
import ClockIcon from '../../../../assets/icons/Clock Circle.svg';
import { REVIEW_SUBJECT_STATS_TIME_OPTIONS } from '../../../../constants/reviewSubjectStats';

function ChevronDownIcon() {
    return (
        <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
    );
}

function buildPieGradient(subjects) {
    let currentStart = 0;

    return `conic-gradient(${subjects
        .map(({ color, share }) => {
            const start = currentStart;
            currentStart += share;
            return `${color} ${start}% ${currentStart}%`;
        })
        .join(', ')})`;
}

function getHoveredSubjectIndex(event, element, subjects) {
    const rect = element.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const center = rect.width / 2;
    const dx = pointerX - center;
    const dy = pointerY - center;
    const distance = Math.hypot(dx, dy);
    const outerRadius = rect.width / 2;
    const ringThickness = 32;
    const innerRadius = outerRadius - ringThickness;

    if (distance < innerRadius || distance > outerRadius) {
        return null;
    }

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalizedAngle = (angle + 450) % 360;
    let accumulatedShare = 0;

    for (let index = 0; index < subjects.length; index += 1) {
        const subject = subjects[index];
        const startAngle = accumulatedShare * 3.6;
        accumulatedShare += subject.share;
        const endAngle = accumulatedShare * 3.6;

        if (normalizedAngle >= startAngle && normalizedAngle < endAngle) {
            return index;
        }
    }

    return subjects.length - 1;
}

function LegendItem({ item, onMouseEnter, onFocus, onBlur }) {
    return (
        <button
            type="button"
            onMouseEnter={onMouseEnter}
            onFocus={onFocus}
            onBlur={onBlur}
            className="flex cursor-pointer items-center gap-1 outline-none"
        >
            <span className="h-4 w-4 shrink-0 rounded-full border-2 border-solid" style={{ borderColor: item.color }} />
            <span className="text-[10px] font-semibold leading-tight text-[#5f666c]">{item.name}</span>
        </button>
    );
}

function SubjectDetailCard({ item }) {
    return (
        <div className="min-h-[76px] overflow-clip rounded-[20px] border-[1.5px] border-solid bg-white py-4 sm:h-[76px] sm:py-10" style={{ borderColor: item.borderColor }}>
            <div className="flex h-full items-center justify-between px-[18px]">
                <div className="flex h-[58px] w-full flex-col justify-between">
                    <div className="flex h-6 items-center justify-between gap-3">
                        <p className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-normal text-[#0c092a]">{item.name}</p>
                        <p className="w-9 text-center text-[13px] font-medium leading-[1.2]" style={{ color: item.color }}>
                            {item.percent}
                        </p>
                    </div>

                    <div className="flex h-[18px] items-center gap-2.5 py-px">
                        <img alt="" className="h-4 w-4 shrink-0" src={ClockIcon} />
                        <p className="text-[12px] font-semibold leading-normal" style={{ color: item.color }}>
                            {item.time}
                        </p>
                    </div>

                    <div className="h-[7px] w-full">
                        <div className="relative h-[7px] w-full">
                            <div className="absolute inset-0 rounded-[100px] bg-[#eeeeee]" />
                            <div
                                className="absolute left-0 top-0 h-[7px] rounded-[100px]"
                                style={{ width: `${item.progressWidth}px`, backgroundColor: item.color }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Tooltip({ subject, visible, left, top }) {
    if (!subject) {
        return null;
    }

    return (
        <div
            className={`pointer-events-none absolute z-10 w-[188px] rounded-xl bg-white px-4 py-3 shadow-[0_4px_19px_rgba(34,34,34,0.12)] transition-all duration-300 ease-out ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{
                left,
                top,
                transform: visible ? 'translate(-50%, calc(-100% - 12px)) scale(1)' : 'translate(-50%, calc(-100% - 12px)) scale(0.95)',
            }}
            aria-hidden="true"
        >
            <div className="text-[12px] leading-none text-[#6c757d]">
                <p className="font-normal">{subject.name}</p>
            </div>

            <div className="my-2 h-px w-full bg-[#f2f4f8]" />

            <div className="flex items-center justify-between gap-3 text-[12px] leading-none text-[#343a40]">
                <span className="font-normal text-[#6c757d]">Tỷ lệ</span>
                <span className="font-semibold text-[#6949ff]">{subject.percent}</span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 text-[12px] leading-none text-[#343a40]">
                <span className="font-normal text-[#6c757d]">Thời gian</span>
                <span className="font-semibold text-[#343a40]">{subject.time}</span>
            </div>

            <div className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white shadow-[0_4px_19px_rgba(34,34,34,0.12)]" />
        </div>
    );
}

export function ReviewSubjectPieChartCard({ periodData, selectedPeriod, onPeriodChange }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [hoveredSubjectIndex, setHoveredSubjectIndex] = useState(null);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
    const dropdownRef = useRef(null);
    const chartRef = useRef(null);

    const selectedPeriodLabel = REVIEW_SUBJECT_STATS_TIME_OPTIONS.find((option) => option.value === selectedPeriod)?.label ?? 'Tuần này';
    const pieGradient = buildPieGradient(periodData.subjects);
    const legendRows = [periodData.subjects.slice(0, 4), periodData.subjects.slice(4)];
    const hoveredSubject = hoveredSubjectIndex === null ? null : periodData.subjects[hoveredSubjectIndex];

    useEffect(() => {
        setHoveredSubjectIndex(null);
        setIsTooltipVisible(false);
    }, [selectedPeriod, periodData]);

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

    const handleChartMouseMove = (event) => {
        if (!chartRef.current) {
            return;
        }

        const rect = chartRef.current.getBoundingClientRect();
        const nextIndex = getHoveredSubjectIndex(event, chartRef.current, periodData.subjects);
        setHoveredSubjectIndex(nextIndex);
        setIsTooltipVisible(nextIndex !== null);

        if (nextIndex !== null) {
            setTooltipPosition({
                left: event.clientX - rect.left + 12,
                top: event.clientY - rect.top + 12,
            });
        }
    };

    const handleLegendHover = (index) => {
        if (!chartRef.current) {
            return;
        }

        const rect = chartRef.current.getBoundingClientRect();
        setHoveredSubjectIndex(index);
        setIsTooltipVisible(true);
        setTooltipPosition({
            left: rect.width / 2,
            top: rect.height / 2,
        });
    };

    return (
        <div className="h-auto min-h-[435px] w-full max-w-none rounded-[20px] bg-white px-4 pb-6 pt-4 shadow-[0_0_16px_rgba(0,0,0,0.06)] sm:max-w-[478px] sm:px-8 sm:pb-8 sm:pt-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <h2 className="flex-1 text-[20px] font-bold leading-tight tracking-[-0.01em] text-[#343a40]">
                    Thống kê môn học đã ôn tập
                </h2>

                <div ref={dropdownRef} className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((currentState) => !currentState)}
                        className="flex cursor-pointer items-center gap-1 rounded-[10px] bg-white px-4 py-2 text-[14px] font-normal leading-tight text-[#343a40] shadow-[0_0_16px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:shadow-[0_0_18px_rgba(0,0,0,0.1)]"
                    >
                        <span>{selectedPeriodLabel}</span>
                        <ChevronDownIcon />
                    </button>

                    {isDropdownOpen ? (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 overflow-hidden rounded-xl border border-[#f2f4f8] bg-white shadow-[0_8px_24px_rgba(34,34,34,0.12)]">
                            {REVIEW_SUBJECT_STATS_TIME_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onPeriodChange(option.value);
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

            <div className="mt-4 flex justify-center">
                <div
                    ref={chartRef}
                    className="relative h-56 w-56 overflow-visible"
                    onMouseLeave={() => setIsTooltipVisible(false)}
                    onMouseMove={handleChartMouseMove}
                >
                    <div className="absolute inset-0 rounded-full border border-white/60 shadow-[0_0_16px_rgba(0,0,0,0.04)]" style={{ backgroundImage: pieGradient }} />
                    <div className="absolute inset-7 rounded-full bg-white shadow-[0_0_0_1px_rgba(242,244,248,0.9)]" />

                    <div className="absolute left-[66px] top-[88px] flex h-12 w-[93px] flex-col items-center justify-between text-center leading-normal">
                        <p className="text-[12px] font-normal tracking-[0.2151px] text-[#848a9c]">Tổng thời gian</p>
                        <p className="text-[18px] font-bold tracking-[0.2766px] text-[#6a5ae0]">{periodData.centerValue}</p>
                    </div>

                    <Tooltip subject={hoveredSubject} visible={isTooltipVisible} {...tooltipPosition} />
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-4" onMouseLeave={() => setIsTooltipVisible(false)}>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-between">
                    {legendRows[0].map((item, index) => (
                        <LegendItem
                            key={item.name}
                            item={item}
                            onBlur={() => setIsTooltipVisible(false)}
                            onFocus={() => {
                                handleLegendHover(index);
                            }}
                            onMouseEnter={() => {
                                handleLegendHover(index);
                            }}
                        />
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start sm:gap-11">
                    {legendRows[1].map((item, index) => (
                        <LegendItem
                            key={item.name}
                            item={item}
                            onBlur={() => setIsTooltipVisible(false)}
                            onFocus={() => {
                                handleLegendHover(index + 4);
                            }}
                            onMouseEnter={() => {
                                handleLegendHover(index + 4);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ReviewSubjectDetailList({ items }) {
    const shouldScroll = items.length > 5;

    return (
        <div className="h-auto min-h-[368px] w-full max-w-none sm:max-w-[478px]">
            <h3 className="text-[20px] font-semibold leading-[1.2] text-[#212121]">Chi tiết từng môn học</h3>

            <div className={`mt-[13px] flex flex-col gap-2.5 ${shouldScroll ? 'max-h-[390px] overflow-y-auto pr-1 thin-scrollbar' : ''}`}>
                {items.map((item) => (
                    <SubjectDetailCard key={item.name} item={item} />
                ))}
            </div>
        </div>
    );
}
