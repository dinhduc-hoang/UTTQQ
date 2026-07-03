import React from 'react';
import Header from '../../pages/user/landing/header';
import SolutionSection from '../../pages/user/landing/solutionSection';
import FeaturesSection from '../../pages/user/landing/featuresSection';
import DataSection from '../../pages/user/landing/dataSection';
import AboutSection from '../../pages/user/landing/aboutSection';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            <Header />
            <main className="pt-[74px] lg:pt-[72px]">
                <SolutionSection />
                <FeaturesSection />
                <DataSection />
                <AboutSection />
            </main>
        </div>
    );
}
