import React from 'react';
import { Link } from 'react-router-dom';
import CtaBackground from '../../../assets/imgs/CTA.png';
import AboutIllustration from '../../../assets/imgs/Students_Discussion_Together.png';
import MailIcon from '../../../assets/icons/mail2.svg';
import PhoneIcon from '../../../assets/icons/phone.svg';
import CheckTickIcon from '../../../assets/icons/checktick.svg';

const HIGHLIGHTS = [
    'Tối ưu hóa trải nghiệm ôn tập cho sinh viên',
    'Kết hợp nhiều phương pháp học hiệu quả (tóm tắt, quiz, flashcard)',
    'Cá nhân hóa lộ trình học tập theo từng người dùng',
    'Hỗ trợ học mọi lúc, mọi nơi trên một nền tảng duy nhất'
];

const CONTACT_ITEMS = [
    {
        icon: MailIcon,
        title: '1234 1234 (Miễn phí, 8:00 – 17:30)',
    },
    {
        icon: PhoneIcon,
        title: 'abg@gmail.com',
    },
];

function HighlightItem({ children }) {
    return (
        <li className="flex items-start gap-3 py-1">
            <img src={CheckTickIcon} alt="" className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="text-[15px] leading-[22.5px] text-[#C4B4FF]">
                {children}
            </span>
        </li>
    );
}

function ContactItem({ icon, title }) {
    return (
        <div className="flex items-center gap-4">
            <img src={icon} alt="" className="h-4 w-4" />
            <p className="text-[15px] font-normal leading-[22.5px] text-[#C4B4FF]">
                {title}
            </p>
        </div>
    );
}

export default function AboutSection() {
    return (
        <section
            id="about-section"
            className="relative overflow-hidden px-6 py-20 scroll-mt-[74px] lg:px-[100px] lg:py-35 lg:scroll-mt-[72px]"
            style={{
                backgroundImage: `url(${CtaBackground})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
            }}
        >
            <div className="relative mx-auto grid w-full max-w-[1316px] items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-16">
                <div className="flex flex-col">
                    <div className="inline-flex w-fit items-center gap-2 px-4 py-2 text-[13px] font-normal uppercase tracking-[2px] text-[#C4B4FF]">
                        Về chúng tôi
                    </div>

                    <h2 className="mt-5 max-w-[590px] text-[30px] font-normal leading-[1.15] tracking-[-1.5px] text-white lg:text-[55px]">
                        Giải pháp hỗ trợ sinh viên học tập và ôn tập hiệu quả.
                    </h2>

                    <p className="mt-5 max-w-[580px] text-[17px] font-normal leading-[25.5px] text-[#C4B4FF]">
                        Mang đến một công cụ học tập đơn giản, trực quan nhưng hiệu quả — giúp sinh viên học nhanh hơn, nhớ lâu hơn và chủ động hơn trong việc học.
                    </p>

                    <ul className="mt-8 flex flex-col gap-3">
                        {HIGHLIGHTS.map((item) => (
                            <HighlightItem key={item}>{item}</HighlightItem>
                        ))}
                    </ul>

                    <div className="mt-8 flex flex-col items-start gap-4">
                        {CONTACT_ITEMS.map((item) => (
                            <ContactItem
                                key={item.title}
                                icon={item.icon}
                                title={item.title}
                                description={item.description}
                            />
                        ))}
                    </div>

                </div>

                <div className="flex justify-end lg:justify-end">
                    <img
                        src={AboutIllustration}
                        alt="Students Discussion Together"
                        className="w-full max-w-xl"
                    />
                </div>
            </div>
        </section>
    );
}
