import React from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from '../../assets/icons/Logo.svg';
import HeroImage from '../../assets/imgs/hero.png';

export default function MainLayout({ children }) {
    return (
        <div className="bg-[#fffefc] relative min-h-screen w-full flex"
            style={{
                backgroundImage: 'linear-gradient(-34.7348595708724deg, rgb(106, 90, 224) 0%, rgb(132, 118, 234) 100%)',
            }}>

            {/* Left Side - Logo & Text */}
            <div className="hidden lg:flex absolute left-6 xl:left-10 2xl:left-14 top-6 xl:top-10 2xl:top-14 flex-col items-start w-[min(100%,28rem)] xl:w-[min(100%,32rem)] 2xl:w-[min(100%,36rem)] max-w-md xl:max-w-lg gap-6">
                <div>
                    <img src={LogoIcon} alt="Logo" className="w-10 h-10 xl:w-[50px] xl:h-[50px] 2xl:w-14 2xl:h-14" />
                </div>
                {/* Text Content */}
                <div className="mt-3">
                    <p className="text-white text-lg xl:text-2xl leading-7 xl:leading-9 tracking-tight max-w-md font-light">
                        Khám phá nhiều kiến thức mới và thử thách bản thân
                    </p>
                </div>
                {/* Hero Image */}
                <div className="ml-35 mt-10 w-170 h-170 flex items-center justify-center z-20">
                    <img src={HeroImage} alt="Hero" className="object-contain w-full h-full" />
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative w-full lg:w-[63%] ml-auto bg-white flex flex-col justify-center items-center px-6 lg:px-32 py-12 lg:rounded-bl-[50px] lg:rounded-tl-[50px] shadow-[-5px_0px_32.1px_4px_rgba(0,0,0,0.15)] z-10">
                <Link
                    to="/landing"
                    className="absolute right-5 top-5 rounded-full border border-[#EDEFFF] bg-white px-4 py-2 text-[13px] font-semibold text-[#6A5AE0] shadow-[0_8px_20px_rgba(106,90,224,0.10)] transition-colors hover:bg-[#F4F1FF] sm:right-8 sm:top-8 sm:text-[14px]"
                >
                    Về trang chủ
                </Link>
                {children}
            </div>
        </div>
    );
}
