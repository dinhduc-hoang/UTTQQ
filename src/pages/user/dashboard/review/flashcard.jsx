import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackArrowIcon from '../../../../assets/icons/Arrow-Left.svg';
import ClockIcon from '../../../../assets/icons/Clock Circle.svg';
import RestartIcon from '../../../../assets/icons/Restart.svg';
import YesIcon from '../../../../assets/icons/yesIcon.svg';
import NoIcon from '../../../../assets/icons/xIcon.svg';
import Rectangle83Background from '../../../../assets/imgs/Rectangle83.png';
import {
    createReviewSubject,
    getReviewSubjectById,
} from '../../../../utils/reviewSubjects';
import {
    getOrCreateTrueFalseQuestionsByDocument,
    normalizeTrueFalseQuestions,
} from '../../../../services/trueFalseService';
import {
    getOrCreateFlashcardSetByDocument,
    normalizeFlashcardSet,
} from '../../../../services/flashcardsService';
import { useSubjects } from '../../../../contexts/SubjectsContext';
import { recordReviewActivity } from '../../../../services/reviewActivityService';

const FEEDBACK_DELAY_MS = 1500;
const FLASHCARD_CHANGE_MS = 520;
const SWIPE_THRESHOLD_PX = 90;

function getExerciseDocumentId(exercise) {
    return exercise?.documentId
        ?? exercise?.document?.id
        ?? exercise?.document?._id
        ?? exercise?.document?.documentId
        ?? exercise?.sourceDocumentId;
}

const FLASHCARDS = [
    {
        id: '1',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Theo Ăngghen, Vấn đề cơ bản lớn của mọi triết học là gì?',
        answer: 'Là vấn đề quan hệ giữa tư duy với tồn tại',
    },
    {
        id: '2',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học xuất hiện vào khoảng thời gian nào?',
        answer: 'Khoảng thế kỷ VIII - VI TCN',
    },
    {
        id: '3',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Trung tâm hình thành triết học cổ đại gồm những nền văn minh nào?',
        answer: 'Trung Quốc, Ấn Độ, Hy Lạp',
    },
    {
        id: '4',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Thuật ngữ “triết” trong Trung Quốc có nghĩa là gì?',
        answer: 'Trí tuệ, hiểu biết sâu sắc',
    },
    {
        id: '5',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Darśana trong triết học Ấn Độ có nghĩa là gì?',
        answer: 'Chiêm ngưỡng, suy ngẫm bằng lý trí',
    },
    {
        id: '6',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Philosophia trong triết học Hy Lạp có nghĩa là gì?',
        answer: 'Yêu mến sự thông thái',
    },
    {
        id: '7',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học thuộc hình thái nào của đời sống xã hội?',
        answer: 'Hình thái ý thức xã hội',
    },
    {
        id: '8',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học nghiên cứu thế giới như thế nào?',
        answer: 'Một chỉnh thể thống nhất',
    },
    {
        id: '9',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học tìm ra những quy luật nào?',
        answer: 'Những quy luật chung nhất chi phối tự nhiên, xã hội loài người, hoạt động và đời sống của con người',
    },
    {
        id: '10',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học hệ thống hóa tri thức bằng gì?',
        answer: 'Tư duy lý luận, logic và khoa học',
    },
    {
        id: '11',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học phản ánh khả năng nào của con người?',
        answer: 'Khả năng nhận thức và đánh giá thế giới',
    },
    {
        id: '12',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Bản chất của triết học là gì?',
        answer: 'Hoạt động tinh thần của con người',
    },
    {
        id: '13',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học nhằm tìm hiểu điều gì của sự vật, hiện tượng?',
        answer: 'Bản chất',
    },
    {
        id: '14',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học cổ đại phương Đông tiêu biểu ở đâu?',
        answer: 'Trung Quốc và Ấn Độ',
    },
    {
        id: '15',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học giúp con người hướng đến điều gì?',
        answer: 'Chân lý và lẽ phải',
    },
    {
        id: '16',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học phản ánh điều gì của con người?',
        answer: 'Khả năng nhận thức và đánh giá thế giới',
    },
    {
        id: '17',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học là hoạt động gì của con người?',
        answer: 'Hoạt động tinh thần',
    },
    {
        id: '18',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học tìm bản chất của cái gì?',
        answer: 'Sự vật, hiện tượng',
    },
    {
        id: '19',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học gắn với nhu cầu nào của con người?',
        answer: 'Tìm hiểu và định hướng thế giới',
    },
    {
        id: '20',
        badge: 'ĐỊNH NGHĨA',
        prompt: 'Triết học thể hiện khát vọng nào của con người?',
        answer: 'Tìm kiếm chân lý và tri thức',
    },
].map((card) => ({
    ...card,
    isDefinitionCorrect: card.isDefinitionCorrect ?? true,
}));

function joinClassNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

function formatElapsedTime(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function getExpectedAnswerType(card) {
    return card?.isDefinitionCorrect ? 'correct' : 'wrong';
}

function ScoreRing({ score }) {
    const size = 168;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const scorePercent = Math.max(0, Math.min(100, (score / 10) * 100));
    const dashOffset = circumference - (scorePercent / 100) * circumference;

    return (
        <div className="relative mx-auto flex h-[168px] w-[168px] items-center justify-center">
            <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox={`0 0 ${size} ${size}`}
                aria-hidden="true"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#ffffff"
                    strokeWidth={strokeWidth}
                    opacity="0.92"
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#6152e6"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    fill="none"
                    className="transition-[stroke-dashoffset] duration-200"
                />
            </svg>

            <div className="flex h-[134px] w-[134px] flex-col items-center justify-center rounded-full text-[#1f1d2c] ]">
                <div className="flex items-end gap-1">
                    <span className="text-[40px] font-semibold leading-none">{score.toFixed(1)}</span>
                    <span className="pb-2 text-[16px] font-normal leading-none text-[#6A5AE0]">/10</span>
                </div>
                <span className="mt-1 text-[13px] font-normal text-[#8c87a7]">Điểm</span>
            </div>
        </div>
    );
}

function DecisionButton({ iconSrc, label, tone, active = false, muted = false, disabled = false, onClick }) {
    const toneStyles = {
        success: {
            circle: 'bg-[#dff5df]',
            label: 'text-[#4AAF57]',
            ring: 'ring-[#4AAF57]',
        },
        danger: {
            circle: 'bg-[#fde5e5]',
            label: 'text-[#f75555]',
            ring: 'ring-[#f75555]',
        },
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={joinClassNames(
                'flex flex-col items-center gap-2 transition-opacity',
                muted ? 'opacity-55' : 'opacity-100',
                disabled ? 'cursor-default' : 'cursor-pointer',
            )}
        >
            <span className={joinClassNames(
                'flex h-[54px] w-[54px] items-center justify-center rounded-full transition-all',
                toneStyles[tone].circle,
                active && `ring-2 ${toneStyles[tone].ring}`,
            )}>
                <img src={iconSrc} alt="" aria-hidden="true" className="h-7 w-7 object-contain" />
            </span>

            <span className={joinClassNames('text-[16px] font-semibold leading-none', toneStyles[tone].label)}>
                {label}
            </span>
        </button>
    );
}

export default function FlashcardReview() {
    const { subjectId, exerciseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const startedAtRef = useRef(Date.now());
    const feedbackTimerRef = useRef(null);
    const flashcardChangeTimerRef = useRef(null);
    const hasRecordedActivityRef = useRef(false);
    const dragStateRef = useRef({ isDragging: false, startX: 0, offsetX: 0 });
    const { updateExercise } = useSubjects();

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

    const reviewMode = location.state?.reviewMode === 'true-false' || location.pathname.includes('/true-false')
        ? 'true-false'
        : 'flashcard';
    const isTrueFalseMode = reviewMode === 'true-false';
    const documentId = getExerciseDocumentId(exercise);
    const subjectTitle = subject.title ?? subject.name ?? 'Môn học';
    const exerciseTitle = exercise?.title ?? 'Bài ôn tập';
    const reviewTitle = isTrueFalseMode ? 'Ôn tập đúng / sai' : 'Ôn tập flashcard';
    const [flashcards, setFlashcards] = useState(FLASHCARDS);
    const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);
    const [flashcardError, setFlashcardError] = useState('');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [phase, setPhase] = useState('practice');
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const [isFlashcardChanging, setIsFlashcardChanging] = useState(false);
    const [cardResponses, setCardResponses] = useState(() => Array(FLASHCARDS.length).fill(null));
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [frozenElapsedSeconds, setFrozenElapsedSeconds] = useState(null);
    const [dragOffsetX, setDragOffsetX] = useState(0);

    const activeCard = flashcards[currentCardIndex] ?? null;
    const answeredCount = cardResponses.filter(Boolean).length;
    const progressPercent = flashcards.length > 0 ? Math.round((answeredCount / flashcards.length) * 100) : 0;
    const correctCount = cardResponses.filter((entry) => entry === 'correct').length;
    const wrongCount = cardResponses.filter((entry) => entry === 'wrong').length;
    const score = flashcards.length > 0
        ? ((isTrueFalseMode ? correctCount : answeredCount) / flashcards.length) * 10
        : 0;

    useEffect(() => {
        let isMounted = true;

        async function loadFlashcards() {
            if (!documentId) {
                setIsLoadingFlashcards(false);
                setFlashcardError(isTrueFalseMode
                    ? 'Bài tập này chưa có mã tài liệu từ backend. Vui lòng tải lại file PDF để sinh câu đúng/sai.'
                    : 'Bài tập này chưa có mã tài liệu từ backend. Vui lòng tải lại file PDF để sinh flashcard.');
                return;
            }

            setIsLoadingFlashcards(true);
            setFlashcardError('');
            setCurrentCardIndex(0);
            setPhase('practice');
            setSelectedAnswer(null);
            setIsAnswerVisible(false);
            setIsFlashcardChanging(false);
            setElapsedSeconds(0);
            setFrozenElapsedSeconds(null);
            startedAtRef.current = Date.now();
            hasRecordedActivityRef.current = false;

            try {
                const normalizedCards = isTrueFalseMode
                    ? normalizeTrueFalseQuestions(
                        await getOrCreateTrueFalseQuestionsByDocument(documentId),
                    )
                    : normalizeFlashcardSet(
                        await getOrCreateFlashcardSetByDocument(documentId),
                    ).cards;

                if (!isMounted) return;

                if (normalizedCards.length === 0) {
                    throw new Error(isTrueFalseMode ? 'Chưa có câu đúng/sai nào.' : 'Bộ flashcard chưa có thẻ nào.');
                }

                setFlashcards(normalizedCards);
                setCardResponses(Array(normalizedCards.length).fill(null));
            } catch (error) {
                if (!isMounted) return;
                setFlashcardError(error?.message || (isTrueFalseMode ? 'Không thể tải câu đúng/sai.' : 'Không thể tải flashcard.'));
                setFlashcards([]);
                setCardResponses([]);
            } finally {
                if (isMounted) {
                    setIsLoadingFlashcards(false);
                }
            }
        }

        loadFlashcards();

        return () => {
            isMounted = false;
        };
    }, [documentId, isTrueFalseMode]);

    useEffect(() => {
        if (phase === 'result') {
            return undefined;
        }

        const timerId = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [phase]);

    useEffect(() => () => {
        if (feedbackTimerRef.current) {
            window.clearTimeout(feedbackTimerRef.current);
        }

        if (flashcardChangeTimerRef.current) {
            window.clearTimeout(flashcardChangeTimerRef.current);
        }
    }, []);

    useEffect(() => {
        resetCardDrag();
    }, [currentCardIndex, phase]);

    function goToNextCard() {
        setSelectedAnswer(null);
        setIsAnswerVisible(false);
        setIsFlashcardChanging(false);

        if (currentCardIndex >= flashcards.length - 1) {
            setFrozenElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
            setPhase('result');
            return;
        }

        setCurrentCardIndex((currentIndex) => Math.min(flashcards.length - 1, currentIndex + 1));
        setPhase('practice');
    }

    function markCurrentFlashcardViewed() {
        if (isTrueFalseMode || !activeCard) {
            return;
        }

        setCardResponses((currentResponses) => {
            if (currentResponses[currentCardIndex]) {
                return currentResponses;
            }

            const nextResponses = [...currentResponses];
            nextResponses[currentCardIndex] = 'viewed';
            return nextResponses;
        });
    }

    function handleFlipFlashcard() {
        if (phase !== 'practice' || isTrueFalseMode || isFlashcardChanging || !activeCard) {
            return;
        }

        if (!isAnswerVisible) {
            markCurrentFlashcardViewed();
        }

        setIsAnswerVisible((currentValue) => !currentValue);
    }

    function handleNextFlashcard() {
        if (phase !== 'practice' || isTrueFalseMode || isFlashcardChanging || !activeCard) {
            return;
        }

        markCurrentFlashcardViewed();

        if (currentCardIndex >= flashcards.length - 1) {
            goToNextCard();
            return;
        }

        if (flashcardChangeTimerRef.current) {
            window.clearTimeout(flashcardChangeTimerRef.current);
        }

        setIsFlashcardChanging(true);
        setIsAnswerVisible(false);

        flashcardChangeTimerRef.current = window.setTimeout(() => {
            setCurrentCardIndex((currentIndex) => Math.min(flashcards.length - 1, currentIndex + 1));
            setPhase('practice');
            setIsFlashcardChanging(false);
        }, FLASHCARD_CHANGE_MS);
    }

    function handleRateCard(answerType) {
        if (!isTrueFalseMode || phase !== 'practice' || selectedAnswer || !activeCard) {
            return;
        }

        const expectedAnswerType = getExpectedAnswerType(activeCard);
        const isUserCorrect = answerType === expectedAnswerType;

        setSelectedAnswer(answerType);
        setCardResponses((currentResponses) => {
            const nextResponses = [...currentResponses];
            nextResponses[currentCardIndex] = isUserCorrect ? 'correct' : 'wrong';
            return nextResponses;
        });
        setPhase('feedback');

        if (feedbackTimerRef.current) {
            window.clearTimeout(feedbackTimerRef.current);
        }

        feedbackTimerRef.current = window.setTimeout(() => {
            goToNextCard();
        }, FEEDBACK_DELAY_MS);
    }

    function resetCardDrag() {
        dragStateRef.current = { isDragging: false, startX: 0, offsetX: 0 };
        setDragOffsetX(0);
    }

    function handleCardPointerDown(event) {
        if (phase !== 'practice' || selectedAnswer || isFlashcardChanging || !activeCard) {
            return;
        }

        event.currentTarget.setPointerCapture?.(event.pointerId);
        dragStateRef.current = {
            isDragging: true,
            startX: event.clientX,
            offsetX: 0,
        };
    }

    function handleCardPointerMove(event) {
        const dragState = dragStateRef.current;

        if (!dragState.isDragging) {
            return;
        }

        const nextOffsetX = event.clientX - dragState.startX;
        dragStateRef.current = {
            ...dragState,
            offsetX: nextOffsetX,
        };
        setDragOffsetX(nextOffsetX);
    }

    function handleCardPointerUp(event) {
        const dragState = dragStateRef.current;

        if (!dragState.isDragging) {
            return;
        }

        event.currentTarget.releasePointerCapture?.(event.pointerId);
        const finalOffsetX = dragState.offsetX;
        resetCardDrag();

        if (finalOffsetX <= -SWIPE_THRESHOLD_PX) {
            handleRateCard('correct');
        } else if (finalOffsetX >= SWIPE_THRESHOLD_PX) {
            handleRateCard('wrong');
        }
    }

    function handleCardKeyDown(event) {
        if (phase !== 'practice' || selectedAnswer || !activeCard) {
            return;
        }

        if (!isTrueFalseMode) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleFlipFlashcard();
            }
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            handleRateCard('correct');
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            handleRateCard('wrong');
        }
    }

    function handleRestart() {
        if (feedbackTimerRef.current) {
            window.clearTimeout(feedbackTimerRef.current);
        }

        startedAtRef.current = Date.now();
        hasRecordedActivityRef.current = false;
        setCurrentCardIndex(0);
        setPhase('practice');
        setSelectedAnswer(null);
        setIsAnswerVisible(false);
        setIsFlashcardChanging(false);
        setCardResponses(Array(flashcards.length).fill(null));
        setElapsedSeconds(0);
        setFrozenElapsedSeconds(null);
    }

    const displayElapsedSeconds = phase === 'result'
        ? frozenElapsedSeconds ?? elapsedSeconds
        : elapsedSeconds;

    useEffect(() => {
        if (phase !== 'result' || hasRecordedActivityRef.current) {
            return;
        }

        const durationSeconds = frozenElapsedSeconds
            ?? Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000));
        const progress = flashcards.length > 0
            ? Math.round(((isTrueFalseMode ? correctCount : answeredCount) / flashcards.length) * 100)
            : 0;
        hasRecordedActivityRef.current = true;

        recordReviewActivity({
            type: isTrueFalseMode ? 'true-false' : 'flashcard',
            subjectId,
            subjectTitle,
            subjectCode: subject.subjectCode,
            exerciseId,
            exerciseTitle,
            documentId,
            startedAt: new Date(startedAtRef.current).toISOString(),
            durationSeconds,
            progress,
            score,
            correctCount,
            wrongCount,
            totalItems: flashcards.length,
        });
        updateExercise(subjectId, exerciseId, {
            progress,
            latestAttemptedAt: 'Hôm nay',
        });
    }, [
        answeredCount,
        correctCount,
        documentId,
        exerciseId,
        exerciseTitle,
        flashcards.length,
        frozenElapsedSeconds,
        isTrueFalseMode,
        phase,
        score,
        subject.subjectCode,
        subjectId,
        subjectTitle,
        updateExercise,
        wrongCount,
    ]);

    const isUserCorrect = selectedAnswer === getExpectedAnswerType(activeCard);
    const isDefinitionCorrect = activeCard?.isDefinitionCorrect ?? true;
    const isSwipeEnabled = isTrueFalseMode;
    const cardRotation = isSwipeEnabled ? Math.max(-8, Math.min(8, dragOffsetX / 18)) : 0;
    const flashcardFaceLabel = isAnswerVisible ? 'Đáp án' : 'Câu hỏi';
    const swipeHint = isSwipeEnabled && dragOffsetX <= -SWIPE_THRESHOLD_PX
        ? 'correct'
        : isSwipeEnabled && dragOffsetX >= SWIPE_THRESHOLD_PX
            ? 'wrong'
            : '';

    return (
        <div className="flex min-h-0 flex-1 flex-col pb-2">
            <div className="mt-4 flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center text-[#212121] transition-opacity hover:opacity-75 cursor-pointer"
                    aria-label="Quay lại màn chọn phương pháp"
                >
                    <img src={BackArrowIcon} alt="" aria-hidden="true" className="h-7 w-7" />
                </button>

                <div className="flex min-w-0 items-center gap-3 text-[18px] font-semibold leading-[1.2] text-[#212121]">
                    <span className="truncate">{subjectTitle}</span>
                    <span className="shrink-0 text-[#6A5AE0]">•</span>
                    <span className="truncate font-semibold">{exerciseTitle}</span>
                </div>
            </div>

            {isLoadingFlashcards ? (
                <div className="mt-8 rounded-[18px] bg-[#f7f7ff] px-5 py-6 text-[14px] text-[#858494]">
                    {isTrueFalseMode ? 'Đang tải câu đúng/sai...' : 'Đang tải flashcard...'}
                </div>
            ) : flashcardError ? (
                <div className="mt-8 rounded-[18px] bg-[#fef2f2] px-5 py-6 text-[14px] text-[#b42318]">
                    {flashcardError}
                </div>
            ) : !activeCard ? (
                <div className="mt-8 rounded-[18px] bg-[#f7f7ff] px-5 py-6 text-[14px] text-[#858494]">
                    {isTrueFalseMode ? 'Chưa có câu đúng/sai nào.' : 'Chưa có flashcard nào.'}
                </div>
            ) : phase !== 'result' ? (
                <div className="flex min-h-0 flex-1 flex-col pb-2">
                    <div className="mt-5 flex items-center justify-between gap-4">
                        <h1 className="text-[20px] font-semibold leading-[1.2] text-[#6A5AE0]">
                            {reviewTitle}
                        </h1>

                        <div className="inline-flex h-[29px] shrink-0 items-center gap-1.5 bg-white px-2 py-px">
                            <img src={ClockIcon} alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                            <p className="text-[15px] font-normal leading-normal text-[#858494]">
                                {formatElapsedTime(displayElapsedSeconds)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center gap-4">
                        <div className="flex-1 overflow-hidden rounded-full bg-[#ebeaf9]">
                            <div
                                className="h-2.5 rounded-full bg-[linear-gradient(90deg,rgb(122,106,245)_0%,rgb(97,82,230)_100%)] transition-[width] duration-200"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        <p className="w-12 shrink-0 text-center text-[15px] font-normal leading-normal text-[#9E9E9E]">
                            {progressPercent}%
                        </p>
                    </div>

                    <div
                        role="button"
                        tabIndex={0}
                        aria-label={isTrueFalseMode ? 'Câu hỏi đúng sai' : `Flashcard - ${flashcardFaceLabel}`}
                        onClick={!isTrueFalseMode ? handleFlipFlashcard : undefined}
                        onPointerDown={isSwipeEnabled ? handleCardPointerDown : undefined}
                        onPointerMove={isSwipeEnabled ? handleCardPointerMove : undefined}
                        onPointerUp={isSwipeEnabled ? handleCardPointerUp : undefined}
                        onPointerCancel={isSwipeEnabled ? resetCardDrag : undefined}
                        onKeyDown={handleCardKeyDown}
                        className={joinClassNames(
                            isTrueFalseMode
                                ? 'mt-4 rounded-[26px] border-2 border-dashed border-[#7b6df4] bg-[#ecebff] px-4 py-5 shadow-[0_14px_44px_rgba(106,90,224,0.05)] transition-shadow sm:px-7 sm:py-6'
                                : 'group mt-4 rounded-[26px] border border-[#d9d4ff] bg-[linear-gradient(135deg,#f8f7ff_0%,#eef6ff_52%,#fff9f2_100%)] px-4 py-4 shadow-[0_18px_46px_rgba(71,63,170,0.14)] transition-[opacity,transform,box-shadow] duration-200 sm:px-7 sm:py-6',
                            !isTrueFalseMode && phase === 'practice' ? 'cursor-pointer hover:shadow-[0_24px_58px_rgba(71,63,170,0.18)]' : '',
                            !isTrueFalseMode && isFlashcardChanging ? 'scale-[0.985] opacity-0 pointer-events-none' : 'opacity-100',
                            phase === 'practice' && isSwipeEnabled ? 'touch-none select-none cursor-grab active:cursor-grabbing' : '',
                        )}
                        style={isSwipeEnabled ? {
                            transform: `translateX(${dragOffsetX}px) rotate(${cardRotation}deg)`,
                            transition: dragStateRef.current.isDragging ? 'none' : 'transform 180ms ease',
                        } : undefined}
                    >
                        <div className="relative min-h-[150px] rounded-3xl">
                            <span className={joinClassNames(
                                'absolute left-0 top-10 rounded-full border px-4 py-1 text-[12px] font-semibold uppercase tracking-[0.4px] transition-opacity',
                                swipeHint === 'correct' ? 'border-[#4AAF57] bg-white text-[#4AAF57] opacity-100' : 'opacity-0',
                            )}>
                                Trái: Đúng
                            </span>
                            <span className={joinClassNames(
                                'absolute right-0 top-10 rounded-full border px-4 py-1 text-[12px] font-semibold uppercase tracking-[0.4px] transition-opacity',
                                swipeHint === 'wrong' ? 'border-[#f75555] bg-white text-[#f75555] opacity-100' : 'opacity-0',
                            )}>
                                Phải: Sai
                            </span>
                            <span className="absolute left-0 top-0 inline-flex rounded-full bg-white px-4 py-1 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#51545f] shadow-[0_1px_2px_rgba(17,24,39,0.08)]">
                                {activeCard.badge}
                            </span>

                            {isTrueFalseMode ? (
                                <div className="flex min-h-[150px] flex-col items-center justify-center px-4 text-center">
                                    <p className="max-w-[640px] text-[20px] font-semibold leading-8 text-[#1d1830] whitespace-pre-line">
                                        {activeCard.prompt}
                                    </p>

                                    <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.4px] text-[#6A5AE0]">
                                        Gạt trái nếu nhận định đúng, gạt phải nếu nhận định sai
                                    </p>
                                </div>
                            ) : (
                                <div className="relative min-h-[260px] [perspective:1400px] sm:min-h-[286px]">
                                    <div
                                        className={joinClassNames(
                                            'absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]',
                                            isAnswerVisible ? '[transform:rotateY(180deg)]' : '',
                                        )}
                                    >
                                        <div className="absolute inset-0 overflow-hidden rounded-[24px] border border-white/80 bg-white/92 px-5 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] [backface-visibility:hidden] sm:px-8 sm:py-7">
                                            <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-[linear-gradient(90deg,#6A5AE0,#5bc0eb,#f4b860)]" />
                                            <div className="flex h-full min-h-[212px] flex-col items-center justify-center">
                                                <span className="inline-flex rounded-full bg-[#f0eeff] px-4 py-1 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#6A5AE0] shadow-[0_1px_2px_rgba(17,24,39,0.05)]">
                                                    Câu hỏi
                                                </span>
                                                <p className="mt-5 max-w-[720px] text-[22px] font-semibold leading-9 text-[#1d1830] whitespace-pre-line sm:text-[24px] sm:leading-10">
                                                    {activeCard.prompt}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="absolute inset-0 overflow-hidden rounded-[24px] border border-[#d9f4e2] bg-[linear-gradient(135deg,#ffffff_0%,#f1fff6_52%,#f7f4ff_100%)] px-5 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:px-8 sm:py-7">
                                            <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-[linear-gradient(90deg,#4AAF57,#6A5AE0)]" />
                                            <div className="flex h-full min-h-[212px] flex-col items-center justify-center">
                                                <span className="inline-flex rounded-full bg-[#e8f9ea] px-4 py-1 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#2f9342] shadow-[0_1px_2px_rgba(17,24,39,0.05)]">
                                                    Đáp án
                                                </span>
                                                <p className="mt-5 max-w-[720px] text-[22px] font-semibold leading-9 text-[#1d1830] whitespace-pre-line sm:text-[24px] sm:leading-10">
                                                    {activeCard.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/80 px-4 py-1 text-[12px] font-semibold text-[#858494] opacity-0 shadow-[0_8px_18px_rgba(17,24,39,0.08)] transition-opacity duration-200 group-hover:opacity-100">
                                        Nhấn vào thẻ để lật
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-end">
                        <p className="text-[15px] font-semibold leading-6 text-[#f75555]">
                            {currentCardIndex + 1}/{flashcards.length}
                        </p>
                    </div>

                    {isTrueFalseMode ? (
                        <div className="mt-5 flex items-center justify-center gap-5 sm:gap-10">
                            <DecisionButton
                                iconSrc={YesIcon}
                                label="Trái: Đúng"
                                active={selectedAnswer === 'correct'}
                                muted={phase === 'feedback' && selectedAnswer !== 'correct'}
                                disabled={phase !== 'practice'}
                                tone="success"
                                onClick={() => handleRateCard('correct')}
                            />

                            <div className="pt-2 text-[34px] font-semibold tracking-[6px] text-[#d6dbe6]">
                                •••
                            </div>

                            <DecisionButton
                                iconSrc={NoIcon}
                                label="Phải: Sai"
                                active={selectedAnswer === 'wrong'}
                                muted={phase === 'feedback' && selectedAnswer !== 'wrong'}
                                disabled={phase !== 'practice'}
                                tone="danger"
                                onClick={() => handleRateCard('wrong')}
                            />
                        </div>
                    ) : (
                        <div className="mt-5 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleNextFlashcard}
                                disabled={!isAnswerVisible || isFlashcardChanging}
                                className="inline-flex h-12 items-center justify-center rounded-full bg-[#7152f3] px-7 text-[15px] font-semibold leading-6 text-white shadow-[0_14px_26px_rgba(113,82,243,0.28)] transition-[background-color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:bg-[#5a41c2] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#c9c3ee] disabled:shadow-none cursor-pointer"
                            >
                                {currentCardIndex >= flashcards.length - 1 ? 'Hoàn thành' : 'Thẻ tiếp theo'}
                            </button>
                        </div>
                    )}

                    {isTrueFalseMode && phase === 'feedback' ? (
                        <div className={joinClassNames(
                            'mt-4 mx-auto w-full max-w-[560px] rounded-[26px] px-6 py-5 text-center',
                            isUserCorrect ? 'bg-[#dff5df]' : 'bg-[#fce2e2]',
                        )}>
                            <p className={joinClassNames(
                                'text-[18px] font-semibold leading-7',
                                isUserCorrect ? 'text-[#4AAF57]' : 'text-[#f75555]',
                            )}>
                                Bạn đã trả lời {isUserCorrect ? 'đúng' : 'sai'}
                            </p>
                            <p className={joinClassNames(
                                'mt-1 text-[16px] leading-7 text-[#96a0a8]',
                            )}>
                                Nhận định này là <span className={joinClassNames('font-semibold', isDefinitionCorrect ? 'text-[#4AAF57]' : 'text-[#f75555]')}>
                                    {isDefinitionCorrect ? 'ĐÚNG' : 'SAI'}
                                </span>
                                {activeCard.explanation ? (
                                    <span className="mt-2 block text-[14px] leading-6 text-[#6b7280]">
                                        {activeCard.explanation}
                                    </span>
                                ) : null}
                            </p>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="mt-5 flex flex-1 flex-col items-center justify-center pb-8">
                    <div className="w-full self-start pl-6 pb-4">
                        <p className='text-[20px] font-semibold leading-[1.2] text-[#6A5AE0]'>{reviewTitle}</p>
                    </div>
                    <div
                        className="relative mt-8 w-full max-w-[360px] overflow-hidden rounded-[26px] bg-[#ebe7ff] px-6 py-6 shadow-[0_18px_50px_rgba(106,90,224,0.10)] sm:mt-25"
                        style={{ backgroundImage: `url(${Rectangle83Background})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'top left', backgroundSize: 'auto 100%' }}
                    >
                        <div className="absolute right-6 top-6 inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-white px-3 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
                            <img src={ClockIcon} alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                            <span className="text-[15px] font-normal leading-none text-[#1f1d2c]">
                                {formatElapsedTime(displayElapsedSeconds)}
                            </span>
                        </div>

                        <div className="pt-14 text-center">
                            <p className="text-[19px] font-semibold leading-7 text-[#1d1830]">
                                {isTrueFalseMode ? 'Bạn đã trả lời đúng' : 'Bạn đã xem flashcard'}
                            </p>
                            <p className="mt-1 text-[20px] font-semibold leading-7 text-[#6A5AE0]">
                                {isTrueFalseMode ? (
                                    <>{correctCount}/{flashcards.length} câu</>
                                ) : (
                                    <>{answeredCount}/{flashcards.length} thẻ</>
                                )}
                            </p>
                        </div>

                        <div className="mt-8">
                            {isTrueFalseMode ? (
                                <ScoreRing score={score} />
                            ) : (
                                <div className="mx-auto flex h-[168px] w-[168px] flex-col items-center justify-center rounded-full bg-white text-[#1f1d2c] shadow-[0_10px_30px_rgba(106,90,224,0.10)]">
                                    <span className="text-[40px] font-semibold leading-none">{progressPercent}%</span>
                                    <span className="mt-2 text-[14px] font-semibold text-[#6A5AE0]">Hoàn thành</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto w-full flex items-center justify-end pt-8">
                        <button
                            type="button"
                            onClick={handleRestart}
                            className="inline-flex h-14 items-center gap-2 rounded-full bg-[#7152f3] px-6 text-[16px] font-normal leading-6 text-white shadow-[0_16px_30px_rgba(113,82,243,0.35)] hover:bg-[#5a41c2] transform-color cursor-pointer"
                        >
                            <span>Làm lại</span>
                            <img src={RestartIcon} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
                        </button>
                    </div>

                    <div className="sr-only">
                        {isTrueFalseMode
                            ? 'Đã hoàn thành phần đúng/sai.'
                            : 'Đã hoàn thành phần flashcard.'}
                    </div>
                </div>
            )}
        </div>
    );
}
