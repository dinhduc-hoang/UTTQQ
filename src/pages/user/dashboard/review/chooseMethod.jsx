import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackArrowIcon from '../../../../assets/icons/Arrow-Left.svg';
import SummaryImage from '../../../../assets/imgs/Gemini_Generated_Image_hmrpifhmrpifhmrp 1.png';
import QuizImage from '../../../../assets/imgs/Gemini_Generated_Image_uc2256uc2256uc22 1.png';
import FlashcardImage from '../../../../assets/imgs/Gemini_Generated_Image_81qrfs81qrfs81qr 1.png';
import {
    createReviewSubject,
    getReviewSubjectById,
} from '../../../../utils/reviewSubjects';

const METHOD_CARDS = [
    {
        key: 'summary',
        title: 'Tóm tắt',
        subtitle: 'Xem nội dung trọng tâm và ghi chú rút gọn',
        buttonLabel: 'Bắt đầu',
        imageSrc: SummaryImage,
        imageAlt: 'Tóm tắt',
        cardClass: 'bg-[#efeefc]',
        titleClass: 'text-[#212121]',
        subtitleClass: 'text-[#64748b]',
        buttonClass: 'border-[#efeefc] bg-white text-[#212121]',
        imageWrapperClass: 'h-[172px]',
    },
    {
        key: 'quiz',
        title: 'Trắc nghiệm',
        subtitle: 'Chọn một trong 4 đáp án đúng nhất',
        buttonLabel: 'Thử thách',
        imageSrc: QuizImage,
        imageAlt: 'Trắc nghiệm',
        cardClass: 'bg-[#a196f1]',
        titleClass: 'text-white',
        subtitleClass: 'text-white/50',
        buttonClass: 'border-[#efeefc] bg-white text-[#6A5AE0]',
        imageWrapperClass: 'h-[163px]',
    },
    {
        key: 'flashcard',
        title: 'Flashcard',
        subtitle: 'Lật thẻ để xem câu hỏi và đáp án ghi nhớ',
        buttonLabel: 'Luyện tập',
        imageSrc: FlashcardImage,
        imageAlt: 'Flashcard',
        cardClass: 'bg-[#b5e3ff]',
        titleClass: 'text-[#6A5AE0]',
        subtitleClass: 'text-[#212121]/50',
        buttonClass: 'border-[#6A5AE0] bg-[#6A5AE0] text-white',
        imageWrapperClass: 'h-[163px]',
    },
    {
        key: 'true-false',
        title: 'Đúng / Sai',
        subtitle: 'Xác định nhận định đúng hay sai từ tài liệu',
        buttonLabel: 'Bắt đầu',
        imageSrc: FlashcardImage,
        imageAlt: 'Đúng sai',
        cardClass: 'bg-[#e8fbf4]',
        titleClass: 'text-[#047857]',
        subtitleClass: 'text-[#212121]/55',
        buttonClass: 'border-[#047857] bg-[#047857] text-white',
        imageWrapperClass: 'h-[163px]',
    },
];

function MethodCard({ card, isBusy }) {
    return (
        <div className={`flex h-80 min-w-0 flex-col overflow-hidden rounded-3xl p-3 ${card.cardClass}`}>
            <div className="text-center">
                <h3 className={`text-[18px] font-semibold leading-[1.2] ${card.titleClass}`}>
                    {card.title}
                </h3>
                <p className={`mt-1 text-[14px] leading-6 ${card.subtitleClass}`}>
                    {card.subtitle}
                </p>
            </div>

            <div className={`mt-3 flex flex-1 items-center justify-center overflow-hidden rounded-[30px] ${card.imageWrapperClass}`}>
                <img src={card.imageSrc} alt={card.imageAlt} className="h-full w-full object-cover" />
            </div>

            <button
                type="button"
                onClick={card.onClick}
                disabled={isBusy}
                className={`mt-2 self-end w-[110px] rounded-xl border px-4 py-2 text-[13px] font-semibold leading-[1.4] tracking-[0.2px] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${card.buttonClass}`}
            >
                {isBusy ? 'Đang mở' : card.buttonLabel}
            </button>
        </div>
    );
}

export default function ChooseMethod() {
    const { subjectId, exerciseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedMethodKey, setSelectedMethodKey] = useState('');

    const { subject, exercise } = useMemo(() => {
        const stateSubject = location.state?.subject;
        const stateExercise = location.state?.exercise;

        const resolvedSubject = stateSubject ?? getReviewSubjectById(subjectId) ?? createReviewSubject({
            id: subjectId || '0',
            name: subjectId ? String(subjectId) : 'Môn học',
            documents: '0 tài liệu đã tải',
        });

        const resolvedExercise = stateExercise
            ?? resolvedSubject.exercises.find((item) => item.id === String(exerciseId))
            ?? resolvedSubject.exercises[0];

        return {
            subject: resolvedSubject,
            exercise: resolvedExercise,
        };
    }, [exerciseId, location.state?.exercise, location.state?.subject, subjectId]);

    const subjectTitle = subject.title ?? subject.name;

    function openMethod(methodKey, path, extraState = {}) {
        if (selectedMethodKey) {
            return;
        }

        setSelectedMethodKey(methodKey);
        navigate(path, {
            state: {
                subject,
                exercise,
                ...extraState,
            },
        });
    }

    const methodCards = METHOD_CARDS.map((card) => ({
        ...card,
        onClick: card.key === 'summary'
            ? () => openMethod(card.key, 'summary-review')
            : card.key === 'quiz'
                ? () => openMethod(card.key, 'practice-multiple-choice-tests')
                : card.key === 'flashcard'
                    ? () => openMethod(card.key, 'flashcard', { reviewMode: 'flashcard' })
                    : card.key === 'true-false'
                        ? () => openMethod(card.key, 'true-false', { reviewMode: 'true-false' })
                    : undefined,
    }));

    return (
        <div className="flex min-h-0 flex-1 flex-col pb-2">
            <div className="mt-4 flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center text-[#212121] transition-opacity hover:opacity-75 cursor-pointer"
                    aria-label="Quay lại màn chi tiết môn học"
                >
                    <img src={BackArrowIcon} alt="" aria-hidden="true" className="h-7 w-7" />
                </button>

                <div className="flex min-w-0 items-center gap-3 text-[18px] font-semibold leading-[1.2] text-[#212121]">
                    <span className="truncate">{subjectTitle}</span>
                    <span className="shrink-0 text-[#6A5AE0]">•</span>
                    <span className="truncate font-semibold">{exercise.title}</span>
                </div>
            </div>

            <div className="mt-3 rounded-2xl border border-[#efeefc] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
                <p className="text-[14px] font-medium text-[#6A5AE0]">
                    Mã môn: <span className="text-[#212121]">{subject.subjectCode || '—'}</span>
                </p>
                <p className="mt-1 text-[13px] font-normal text-[#858494]">
                    {subject.description || 'Chưa có mô tả.'}
                </p>
            </div>

            <div className="mt-5">
                <h1 className="text-[20px] font-semibold leading-[1.2] text-[#6A5AE0]">
                    Lựa chọn phương pháp
                </h1>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-4">
                {methodCards.map((card) => (
                    <MethodCard key={card.key} card={card} isBusy={Boolean(selectedMethodKey)} />
                ))}
            </div>
        </div>
    );
}
