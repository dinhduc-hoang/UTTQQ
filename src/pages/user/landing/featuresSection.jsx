import React from 'react';
import { Link } from 'react-router-dom';
import ChartIcon from '../../../assets/icons/Chart.svg';
import MagicStickIcon from '../../../assets/icons/Magic Stick.svg';
import LockKeyholeIcon from '../../../assets/icons/Lock Keyhole.svg';
import CheckboxIcon from '../../../assets/icons/checkbox.svg';
import ArrowLeftIcon from '../../../assets/icons/Arrow - Left.svg';

const BULLETS = [
    'Dashboard học tập real-time cho toàn bộ môn học',
    'Tự động theo dõi tiến độ, kết quả và lịch sử ôn tập',
    'Phát hiện sớm điểm yếu và nội dung cần cải thiện',
    'Trải nghiệm học tập cá nhân hóa theo từng người dùng',
];

function FeatureBullet({ children }) {
    return (
        <li className="flex items-center gap-2.5">
            <img src={CheckboxIcon} alt="" className="h-5 w-5 shrink-0" />
            <span className="text-[15px] leading-[22.5px] text-[#4A5565]">
                {children}
            </span>
        </li>
    );
}

function RightCard({ icon, title, description, iconClassName = 'h-6 w-6' }) {
    return (
        <div className="flex justify-center gap-4 rounded-[14px] border border-white bg-white px-[17px] py-[17px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05),0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="flex items-start gap-5">
                <div className="flex w-7 shrink-0 items-start justify-center pt-2.5">
                    <img src={icon} alt="" className={iconClassName} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1">
                        <h4 className="text-[14px] font-semibold leading-[21px] text-[#6949FF]">
                            {title}
                        </h4>
                        <p className="text-[13px] font-normal leading-[21.125px] text-[#6A7282]">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Features() {
    return (
        <section
            id="features-section"
            className="scroll-mt-[74px] border-y border-[#F3F4F6] bg-[rgba(249,250,251,0.4)] px-6 py-20 lg:scroll-mt-[72px] lg:px-[100px] lg:py-24"
        >
            <div className="mx-auto flex max-w-[1216px] flex-col items-center gap-10">
                <div className="flex max-w-[810px] flex-col items-center gap-5 text-center">
                    <p
                        className="text-[13px] font-semibold uppercase tracking-[2px] text-[#6949FF]"
                    >
                        Hệ sinh thái sản phẩm
                    </p>
                    <h2
                        className="max-w-full text-[30px] font-normal leading-[1.15] tracking-[-1.5px] text-[#101828] lg:text-[38px]"
                    >
                        Toàn bộ quá trình ôn tập của bạn gói gọn trong một nền tảng.
                    </h2>
                    <p
                        className="max-w-2xl text-[16px] font-normal leading-[25.5px] text-[#6A7282] lg:text-[16px]"
                    >
                        Hệ thống ôn tập thông minh giúp bạn quản lý môn học, theo dõi tiến độ và học hiệu quả hơn với nhiều phương pháp như tóm tắt, trắc nghiệm và flashcard. Tất cả đều được cá nhân hóa theo hành trình học của bạn.
                    </p>
                </div>

                <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,576px)_minmax(0,576px)] lg:gap-16">
                    <div className="relative flex min-h-[454px] flex-col">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#DDD6FF] bg-[#F5F3FF] px-[13px] py-[7px]">
                            <span className="text-[12px] leading-[18px]">
                                🏛️
                            </span>
                            <span className="text-[12px] font-semibold leading-[18px] text-[#6949FF]">
                                Sinh viên
                            </span>
                        </div>

                        <h3
                            className="mt-6 max-w-[549px] text-[30px] font-normal leading-[1.15] tracking-[-0.8px] text-[#101828] lg:text-[28px]"
                        >
                            Quản lý việc học và ôn tập hiệu quả trên một nền tảng duy nhất.
                        </h3>

                        <p
                            className="mt-5 max-w-[568px] text-[15px] font-normal leading-[26px] text-[#6A7282] lg:text-[16px]"
                        >
                            Hệ thống hiển thị tiến độ học theo từng môn, từng bài ôn và lịch sử học gần đây — giúp bạn biết mình đang ở đâu và cần cải thiện gì.
                        </p>

                        <ul className="mt-9 flex flex-col gap-3">
                            {BULLETS.map((bullet) => (
                                <FeatureBullet key={bullet}>{bullet}</FeatureBullet>
                            ))}
                        </ul>

                        <Link
                            to="/login"
                            className="mt-9 inline-flex h-[50px] w-47 items-center justify-center gap-3 rounded-full bg-[#6949FF] px-4 text-[16px] font-normal text-white shadow-[4px_8px_24px_0px_rgba(77,93,250,0.25)] hover:bg-[#5a4ad0] transition-colors"
                        >
                            <span>Tìm hiểu thêm</span>
                            <img src={ArrowLeftIcon} alt="" className="h-7 w-7" />
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-[#DDD6FF] bg-[#EDEFFF] px-[33px] pt-[33px] pb-[33px]">
                        <div className="flex flex-col gap-4">
                            <RightCard
                                icon={ChartIcon}
                                iconClassName="h-[27px] w-[28px]"
                                title="Theo dõi tiến độ"
                                description="Nắm rõ toàn bộ hành trình học tập của bạn trong một màn hình, không cần tự ghi nhớ."
                            />
                            <RightCard
                                icon={MagicStickIcon}
                                title="Học tập thông minh"
                                description="Dữ liệu được lưu tự động giúp bạn quay lại bài đang học, tiếp tục đúng vị trí và tối ưu thời gian ôn tập."
                            />
                            <RightCard
                                icon={LockKeyholeIcon}
                                title="Cá nhân hóa trải nghiệm"
                                description="Hệ thống ghi nhớ thói quen học tập và ưu tiên hiển thị nội dung."
                            />

                            <div className="rounded-[14px] bg-[#6949FF] px-4 py-4 text-[13px] font-normal leading-[19.5px] text-white opacity-90">
                                “Hệ thống giúp tôi học có định hướng hơn và không bỏ sót kiến thức quan trọng.”
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
