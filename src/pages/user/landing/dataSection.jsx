import React from 'react';

const STATS = [
    {
        value: '100%',
        title: 'Theo dõi tiến độ học tập',
        subtitle: 'Tiến độ học tập',
    },
    {
        value: '1,000+',
        title: 'Lượt học tập',
        subtitle: 'Trên nhiều môn học',
    },
    {
        value: '24/7',
        title: 'Học mọi lúc',
        subtitle: 'Không giới hạn',
    },
    {
        value: '3+',
        title: 'Phương pháp học',
        subtitle: 'Trong một nền tảng',
    },
];

function StatItem({ value, title, subtitle, isLast }) {
    return (
        <div
            className={`flex min-h-[114px] flex-col items-center justify-center px-6 py-6 text-center lg:py-0 ${isLast ? '' : 'lg:border-r lg:border-[#E5E7EB]'}`}
        >
            <div className="flex flex-col items-center justify-center">
                <p className="text-[40px] font-normal leading-[60px] tracking-[-1px] text-[#6949FF]">
                    {value}
                </p>
                <p className="text-[15px] font-semibold leading-[22.5px] text-[#1E2939]">
                    {title}
                </p>
                <p className="text-[13px] font-normal leading-[19.5px] text-[#99A1AF]">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

export default function DataSection() {
    return (
        <section
            id="stats-section"
            className="scroll-mt-[74px] border-y border-[#F3F4F6] bg-[rgba(249,250,251,0.5)] px-6 lg:scroll-mt-[72px] lg:px-[100px] h-[299px] flex items-center justify-center"
        >
            <div className="mx-auto grid w-full max-w-[1920px] grid-cols-1 lg:grid-cols-4 lg:h-[114px]">
                {STATS.map((stat, index) => (
                    <StatItem
                        key={stat.title}
                        value={stat.value}
                        title={stat.title}
                        subtitle={stat.subtitle}
                        isLast={index === STATS.length - 1}
                    />
                ))}
            </div>
        </section>
    );
}
