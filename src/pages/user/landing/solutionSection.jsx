import React from 'react';
import SolutionBackground from '../../../assets/imgs/solution.png';
import StarIcon from '../../../assets/icons/star.svg';


export default function SolutionSection() {
    return (
        <section
            id="solution-section"
            className="relative flex min-h-[780px] scroll-mt-[74px] items-center justify-center overflow-hidden px-6 py-20 lg:scroll-mt-[72px] lg:px-10 lg:py-24"
            style={{
                backgroundImage: `url(${SolutionBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)]" />

            <div
                className="relative z-10 w-full max-w-[644px] rounded-[40px] border-2 border-white p-8 shadow-[0px_20px_56px_0px_rgba(0,0,0,0.2)] backdrop-blur-[21px] lg:p-10"
                style={{
                    backgroundImage:
                        'linear-gradient(90deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.5) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.28) 100%)',
                }}
            >
                <div className="flex flex-col items-center gap-[30px]">
                    <div className="flex w-full items-center justify-center gap-8">
                        <img src={StarIcon} alt="" className="h-7 w-[24.378px] shrink-0" />
                        <div className="rounded-full bg-[linear-gradient(90deg,#7A5CFF_0%,#57B8FF_33%,#6BE28A_66%,#FF7FB2_100%)] p-[1.5px]">
                            <div className="rounded-full bg-white px-4 py-2 text-center text-[14px] font-semibold leading-6 text-[#303030]">
                                Nền tảng ôn tập trắc nghiệm bằng AI
                            </div>
                        </div>
                        <img src={StarIcon} alt="" className="h-7 w-[24.378px] shrink-0" />
                    </div>

                    <div className="flex w-full flex-col items-center gap-4">
                        <h2 className="max-w-[438px] text-center text-[30px] font-semibold leading-[1.1] text-[#212121]">
                            Học tập thông minh và hiệu quả hơn
                        </h2>
                        <p className="w-full text-center text-[16px] font-normal leading-7 text-[#6D6D6D]">
                            Học hỏi kiến thức mới thông qua những bộ câu hỏi đa dạng. Theo dõi tiến trình và cải thiện kỹ năng của bạn sau mỗi lần làm quiz.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
