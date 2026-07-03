import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '../../assets/icons/Arrow-Left.svg';
import { ONBOARD_STEPS } from '../../constants/accountOptions';

export default function Onboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(location.state?.step === 'workspace' ? 'workspace' : 'account');
    const [selectedByStep, setSelectedByStep] = useState(
        location.state?.selectedByStep ?? {
            account: null,
            workspace: null,
        }
    );

    const currentStep = ONBOARD_STEPS[activeStep];
    const selectedType = selectedByStep[activeStep];
    const isWorkspaceStep = activeStep === 'workspace';

    const handleBack = () => {
        if (isWorkspaceStep) {
            setActiveStep('account');
            return;
        }

        navigate('/login');
    };

    const goNext = () => {
        if (!isWorkspaceStep) {
            setActiveStep('workspace');
            return;
        }

        navigate('/register', { state: { selectedByStep } });
    };

    const handleSelect = (optionId) => {
        setSelectedByStep((currentSelected) => ({
            ...currentSelected,
            [activeStep]: currentSelected[activeStep] === optionId ? null : optionId,
        }));
    };

    return (
        <div className="flex w-full max-w-[549px] flex-col gap-5">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={handleBack}
                    className="shrink-0 rounded-full p-1 cursor-pointer"
                    aria-label="Quay lại"
                >
                    <img src={ArrowLeftIcon} alt="" className="h-7 w-7" />
                </button>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#EEE]">
                    <div className={`h-full rounded-full bg-[#6A5AE0] ${currentStep.progressWidth}`} />
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center text-center sm:mt-10">
                <h2 className="max-w-[480px] text-[30px] font-semibold leading-[1.12] text-[#212121] sm:text-[35px]">
                    {currentStep.title}
                </h2>
                <p className="mt-3 text-base font-light text-[#212121]">{currentStep.subtitle}</p>
            </div>

            <div className="mt-1 flex flex-col gap-3 sm:gap-4">
                {currentStep.options.map((option) => {
                    const isSelected = selectedType === option.id;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(option.id)}
                            className={`flex min-h-[88px] items-center gap-4 rounded-[20px] px-4 text-left transition-all sm:min-h-[100px] sm:px-5 ${isSelected
                                ? 'border-[2px] border-[#6A5AE0] bg-[#f7f5ff] shadow-[0_12px_30px_rgba(106,90,224,0.14)]'
                                : 'border border-[#EEE] bg-white hover:border-[#d7d7d7] hover:bg-[#fafafa]'
                                }`}
                        >
                            <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-colors sm:h-20 sm:w-20 ${isSelected ? 'bg-[#6A5AE0]' : 'bg-[#EDEFFF]'}`}>
                                <img src={option.icon} alt="" className={`h-7 w-7 sm:h-8 sm:w-8 ${isSelected ? 'brightness-0 invert' : ''}`} />
                            </span>
                            <span className="min-w-0 flex-1 text-[18px] font-medium leading-[1.2] text-[#212121] sm:text-[20px]">
                                {option.label}
                            </span>
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? 'border-[#6A5AE0] bg-[#6A5AE0]' : 'border-[#d8d8e8] bg-white'}`}>
                                <span className={`h-2.5 w-2.5 rounded-full bg-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:mt-6">
                <button
                    type="button"
                    onClick={goNext}
                    className="h-14 rounded-full bg-[#6A5AE0] px-4 text-[16px] font-semibold text-white shadow-[4px_8px_24px_0_rgba(77,93,250,0.25)] transition-colors hover:bg-[#5a4ad0]"
                >
                    {isWorkspaceStep ? 'Xác nhận' : 'Xác nhận và tiếp tục'}
                </button>

                <button
                    type="button"
                    onClick={goNext}
                    className="h-14 rounded-full border border-[#E6E2FF] bg-white px-4 text-[16px] font-medium text-[#6A5AE0] transition-colors hover:bg-[#f7f5ff]"
                >
                    Bỏ qua
                </button>
            </div>
        </div>
    );
}
