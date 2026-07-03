import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackArrowIcon from '../../../../assets/icons/Arrow-Left.svg';
import ClockIcon from '../../../../assets/icons/Clock Circle.svg';
import DangerTriangleIcon from '../../../../assets/icons/Danger Triangle.svg';
import CorrectStatusIcon from '../../../../assets/icons/Icon.svg';
import ExcludePurpleIcon from '../../../../assets/icons/ExcludePurple.svg';
import SendIcon from '../../../../assets/icons/File Send.svg';
import Rectangle83Background from '../../../../assets/imgs/Rectangle83.png';
import PenIcon from '../../../../assets/icons/pen.svg';
import {
    createReviewSubject,
    getReviewSubjectById,
} from '../../../../utils/reviewSubjects';
import {
    getOrCreateExamByDocument,
    normalizeExam,
} from '../../../../services/examsService';
import { useSubjects } from '../../../../contexts/SubjectsContext';
import { recordReviewActivity } from '../../../../services/reviewActivityService';

function joinClassNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

function formatElapsedTime(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const DEFAULT_QUESTION_INDEX = 4;

function getExerciseDocumentId(exercise) {
    return exercise?.documentId
        ?? exercise?.document?.id
        ?? exercise?.document?._id
        ?? exercise?.document?.documentId
        ?? exercise?.sourceDocumentId;
}

function buildInitialAnswers(questions) {
    return questions.reduce((accumulator, question) => {
        accumulator[question.id] = null;
        return accumulator;
    }, {});
}

function getQuestionResult(question, selectedOptionIndex) {
    const isAnswered = selectedOptionIndex !== null && selectedOptionIndex !== undefined;
    const isCorrect = isAnswered && selectedOptionIndex === question.correctOptionIndex;

    return {
        isAnswered,
        isCorrect,
    };
}

function QuizOptionButton({
    label,
    optionIndex,
    selectedOptionIndex,
    isReviewMode,
    question,
    onClick,
}) {
    const isSelected = selectedOptionIndex === optionIndex;
    const isCorrectAnswer = isReviewMode && optionIndex === question.correctOptionIndex;
    const isWrongSelection = isReviewMode && isSelected && !isCorrectAnswer;

    const cardClassName = isReviewMode
        ? joinClassNames(
            'border bg-white transition-colors',
            isCorrectAnswer && 'border-[#6fc56d] bg-[#eef9ef]',
            isWrongSelection && 'border-[#ff9b9b] bg-[#fff1f1]',
            !isCorrectAnswer && !isWrongSelection && 'border-transparent',
        )
        : joinClassNames(
            'border bg-white transition-colors hover:border-[#d5ccff]',
            isSelected && 'border-[#7152f3] shadow-[0_0_0_1px_rgba(113,82,243,0.16)]',
            !isSelected && 'border-transparent',
        );

    const radioClassName = joinClassNames(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        isReviewMode
            ? isCorrectAnswer
                ? 'border-[#6fc56d] bg-[#6fc56d]'
                : isWrongSelection
                    ? 'border-[#ef4444] bg-[#ef4444]'
                    : 'border-[#7667ea] bg-white'
            : isSelected
                ? 'border-[#7152f3] bg-[#7152f3]'
                : 'border-[#7152f3] bg-white',
    );

    return (
        <button
            type="button"
            onClick={onClick}
            className={joinClassNames(
                'flex min-h-14 w-full items-center gap-3 rounded-[14px] px-4 py-3 text-left shadow-[0_8px_20px_rgba(17,24,39,0.03)] transition-transform hover:-translate-y-px cursor-pointer',
                cardClassName,
            )}
        >
            <span className={radioClassName}>
                {isReviewMode ? (
                    isCorrectAnswer ? (
                        <span className="text-[12px] font-bold leading-none text-white">✓</span>
                    ) : isWrongSelection ? (
                        <span className="text-[12px] font-bold leading-none text-white">✕</span>
                    ) : null
                ) : isSelected ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                ) : null}
            </span>

            <span className="min-w-0 flex-1 text-[15px] leading-6 text-[#2a2438]">
                {label}
            </span>

            {isReviewMode && isCorrectAnswer ? (
                <span className="shrink-0 text-[18px] font-bold leading-none text-[#6fc56d]">✓</span>
            ) : null}
        </button>
    );
}

function StatusCard({ value, label, className, iconSrc }) {
    return (
        <div className={joinClassNames('relative rounded-[18px] px-4 py-4', className)}>
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center">
                <img src={iconSrc} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
            </div>
            <div className="mt-4 text-[26px] font-semibold leading-none">{value}</div>
            <div className="mt-2 text-[13px] font-medium leading-5 opacity-80">{label}</div>
        </div>
    );
}

function ReviewChip({ index, result, active, onClick }) {
    const chipClassName = joinClassNames(
        'inline-flex h-8 items-center gap-1.5 rounded-[10px] px-2.5 text-[15px] font-semibold transition-colors cursor-pointer',
        result.isCorrect && 'text-[#58b65a]',
        result.isAnswered && !result.isCorrect && 'text-[#f75555]',
        !result.isAnswered && 'text-[#f59e0b]',
        active && 'border border-[#6fc56d] bg-[#eef9ef] text-[#48a84e]',
        !active && 'bg-white',
    );

    return (
        <button type="button" onClick={onClick} className={chipClassName}>
            <span>{index + 1}</span>
            <span
                className={joinClassNames(
                    'h-3 w-3 rounded-full',
                    result.isCorrect && 'bg-[#58b65a]',
                    result.isAnswered && !result.isCorrect && 'bg-[#f75555]',
                    !result.isAnswered && 'bg-[#f59e0b]',
                    active && 'ring-2 ring-[#6fc56d]/35',
                )}
            />
        </button>
    );
}

function ScoreRing({ score }) {
    const scorePercent = Math.max(0, Math.min(100, (score / 10) * 100));
    const size = 170;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (scorePercent / 100) * circumference;

    return (
        <div className="relative mx-auto flex h-[170px] w-[170px] items-center justify-center">
            <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox={`0 0 ${size} ${size}`}
                aria-hidden="true"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#6A5AE0"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    fill="none"
                    className="transition-[stroke-dashoffset] duration-200"
                />
            </svg>

            <div className="flex h-[146px] w-[146px] flex-col items-center justify-center rounded-full bg-[#f5f3ff] text-[#1b1634] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]">
                <div className="flex items-end gap-1">
                    <span className="text-[40px] font-semibold leading-none">{score.toFixed(1)}</span>
                    <span className="pb-2 text-[16px] font-normal leading-none text-[#6A5AE0]">/10</span>
                </div>
                <span className="mt-1 text-[13px] font-normal text-[#9189a9]">Điểm</span>
            </div>
        </div>
    );
}

export default function PracticeMultipleChoiceTests() {
    const { subjectId, exerciseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const startedAtRef = useRef(Date.now());
    const hasRecordedActivityRef = useRef(false);
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

    const documentId = getExerciseDocumentId(exercise);
    const subjectTitle = subject.title ?? subject.name ?? 'Môn học';
    const exerciseTitle = exercise?.title ?? 'Bài ôn tập';
    const [questions, setQuestions] = useState([]);
    const [isLoadingExam, setIsLoadingExam] = useState(true);
    const [examError, setExamError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [frozenElapsedSeconds, setFrozenElapsedSeconds] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});

    useEffect(() => {
        let isMounted = true;

        async function loadExam() {
            if (!documentId) {
                setIsLoadingExam(false);
                setExamError('Bài tập này chưa có mã tài liệu từ backend. Vui lòng tải lại file PDF để sinh đề trắc nghiệm.');
                return;
            }

            setIsLoadingExam(true);
            setExamError('');
            setIsSubmitted(false);
            setFrozenElapsedSeconds(null);
            setElapsedSeconds(0);
            startedAtRef.current = Date.now();
            hasRecordedActivityRef.current = false;

            try {
                const payload = await getOrCreateExamByDocument(documentId);
                const normalizedExam = normalizeExam(payload);

                if (!isMounted) return;

                if (normalizedExam.questions.length === 0) {
                    throw new Error('Đề trắc nghiệm chưa có câu hỏi.');
                }

                const initialQuestionIndex = Math.min(DEFAULT_QUESTION_INDEX, normalizedExam.questions.length - 1);
                setQuestions(normalizedExam.questions);
                setSelectedAnswers(buildInitialAnswers(normalizedExam.questions));
                setCurrentQuestionIndex(initialQuestionIndex);
                setReviewQuestionIndex(0);
            } catch (error) {
                if (!isMounted) return;
                setExamError(error?.message || 'Không thể tải đề trắc nghiệm.');
                setQuestions([]);
                setSelectedAnswers({});
            } finally {
                if (isMounted) {
                    setIsLoadingExam(false);
                }
            }
        }

        loadExam();

        return () => {
            isMounted = false;
        };
    }, [documentId]);

    const questionResults = useMemo(() => questions.map((question) => {
        const selectedOptionIndex = selectedAnswers[question.id] ?? null;

        return {
            question,
            selectedOptionIndex,
            ...getQuestionResult(question, selectedOptionIndex),
        };
    }), [questions, selectedAnswers]);

    const correctCount = questionResults.filter((result) => result.isCorrect).length;
    const wrongCount = questionResults.filter((result) => result.isAnswered && !result.isCorrect).length;
    const blankCount = questionResults.filter((result) => !result.isAnswered).length;
    const score = questions.length > 0 ? (correctCount / questions.length) * 10 : 0;
    const answeredCount = questionResults.filter((result) => result.isAnswered).length;
    const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

    useEffect(() => {
        if (isSubmitted) {
            return undefined;
        }

        const timerId = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [isSubmitted]);

    const activeQuestion = questions[currentQuestionIndex] ?? null;
    const activeSelectedOptionIndex = activeQuestion ? selectedAnswers[activeQuestion.id] ?? null : null;

    function handleSelectOption(questionId, optionIndex) {
        if (isSubmitted) {
            return;
        }

        setSelectedAnswers((currentAnswers) => ({
            ...currentAnswers,
            [questionId]: currentAnswers[questionId] === optionIndex ? null : optionIndex,
        }));
    }

    function handleSubmit() {
        if (isSubmitted) {
            return;
        }

        const durationSeconds = Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000));
        setFrozenElapsedSeconds(durationSeconds);
        setIsSubmitted(true);
        setReviewQuestionIndex(0);

        if (!hasRecordedActivityRef.current) {
            hasRecordedActivityRef.current = true;
            const progress = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

            recordReviewActivity({
                type: 'quiz',
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
                blankCount,
                totalItems: questions.length,
            });
            updateExercise(subjectId, exerciseId, {
                progress,
                latestAttemptedAt: 'Hôm nay',
            });
        }
    }

    const displayElapsedSeconds = isSubmitted
        ? frozenElapsedSeconds ?? elapsedSeconds
        : elapsedSeconds;

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

            {isLoadingExam ? (
                <div className="mt-8 rounded-[18px] bg-[#f7f7ff] px-5 py-6 text-[14px] text-[#858494]">
                    Đang tải đề trắc nghiệm...
                </div>
            ) : examError ? (
                <div className="mt-8 rounded-[18px] bg-[#fef2f2] px-5 py-6 text-[14px] text-[#b42318]">
                    {examError}
                </div>
            ) : !activeQuestion ? (
                <div className="mt-8 rounded-[18px] bg-[#f7f7ff] px-5 py-6 text-[14px] text-[#858494]">
                    Đề trắc nghiệm chưa có câu hỏi.
                </div>
            ) : !isSubmitted ? (
                <div className="flex min-h-0 flex-1 flex-col pb-2">
                    <div className="mt-5 flex items-center justify-between gap-4">
                        <h1 className="text-[20px] font-semibold leading-[1.2] text-[#6A5AE0]">
                            Ôn tập trắc nghiệm
                        </h1>

                        <div className="inline-flex h-[29px] shrink-0 items-center gap-1.5 rounded-[10px] bg-white px-2 py-px shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
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

                    <div className="mt-4 rounded-[28px] border border-dashed border-[#7b6df4] bg-[#ecebff] px-6 py-12 shadow-[0_16px_50px_rgba(106,90,224,0.06)]">
                        <p className="mx-auto max-w-[560px] text-center text-[20px] font-normal leading-normal text-[#2c2940] whitespace-pre-line">
                            {activeQuestion.prompt}
                        </p>
                    </div>

                    <div className="mt-2 flex items-center justify-end">
                        <p className="text-[15px] font-normal leading-6 text-[#f75555]">
                            {currentQuestionIndex + 1}/{questions.length}
                        </p>
                    </div>

                    <div className="mt-4 space-y-3">
                        {activeQuestion.options.map((option, optionIndex) => (
                            <QuizOptionButton
                                key={option}
                                label={option}
                                optionIndex={optionIndex}
                                selectedOptionIndex={activeSelectedOptionIndex}
                                isReviewMode={false}
                                question={activeQuestion}
                                onClick={() => handleSelectOption(activeQuestion.id, optionIndex)}
                            />
                        ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => setCurrentQuestionIndex((currentIndex) => Math.max(0, currentIndex - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#efecff] text-[#6A5AE0] shadow-[0_8px_20px_rgba(106,90,224,0.08)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                aria-label="Câu trước"
                            >
                                <img src={ExcludePurpleIcon} alt="" aria-hidden="true" className="h-3.5 w-[15px]" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setCurrentQuestionIndex((currentIndex) => Math.min(questions.length - 1, currentIndex + 1))}
                                disabled={currentQuestionIndex === questions.length - 1}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#efecff] text-[#6A5AE0] shadow-[0_8px_20px_rgba(106,90,224,0.08)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                aria-label="Câu tiếp theo"
                            >
                                <img
                                    src={ExcludePurpleIcon}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-3.5 w-[15px] rotate-180"
                                />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="inline-flex h-14 items-center gap-2 rounded-full bg-[#7152f3] px-6 text-[16px] font-normal leading-6 text-white shadow-[0_16px_30px_rgba(113,82,243,0.35)] transition-transform hover:-translate-y-px cursor-pointer"
                        >
                            <span>Nộp bài</span>
                            <img src={SendIcon} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-5 grid min-h-0 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <aside
                        className="relative overflow-hidden rounded-[26px] bg-[#ebe7ff] bg-no-repeat px-6 py-6 shadow-[0_18px_50px_rgba(106,90,224,0.10)]"
                        style={{ backgroundImage: `url(${Rectangle83Background})`, backgroundSize: 'auto', backgroundPosition: 'top left' }}
                    >
                        <div className="absolute right-6 top-6 inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-white px-3 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
                            <img src={ClockIcon} alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                            <span className="text-[15px] font-normal leading-none text-[#1f1d2c]">
                                {formatElapsedTime(displayElapsedSeconds)}
                            </span>
                        </div>

                        <div className="pt-16 text-center">
                            <p className="text-[18px] font-semibold leading-7 text-[#1d1830]">
                                Bạn đã trả lời đúng
                            </p>
                            <p className="mt-1 text-[20px] font-semibold leading-7 text-[#6A5AE0]">
                                {correctCount}/{questions.length} câu
                            </p>
                        </div>

                        <div className="mt-8">
                            <ScoreRing score={score} />
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-3">
                            <StatusCard
                                value={blankCount}
                                label="Chưa làm"
                                className="bg-white text-[#1d1830]"
                                iconSrc={PenIcon}
                            />
                            <StatusCard
                                value={wrongCount}
                                label="Sai"
                                className="bg-[#bac8ff] text-[#364ca1]"
                                iconSrc={DangerTriangleIcon}
                            />
                            <StatusCard
                                value={correctCount}
                                label="Đúng"
                                className="bg-[#7152f3] text-white"
                                iconSrc={CorrectStatusIcon}
                            />
                        </div>
                    </aside>

                    <section className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-[18px] font-semibold leading-7 text-[#1d1830]">
                                Xem đáp án
                            </h2>

                            <div className="flex flex-wrap gap-3">
                                {questionResults.map((result, index) => (
                                    <ReviewChip
                                        key={result.question.id}
                                        index={index}
                                        result={result}
                                        active={reviewQuestionIndex === index}
                                        onClick={() => setReviewQuestionIndex(index)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 rounded-[22px] bg-[#f7f7ff] px-5 py-5 shadow-[0_10px_30px_rgba(17,24,39,0.03)]">
                            <p className="text-[18px] font-medium leading-8 text-[#2c2940]">
                                {reviewQuestionIndex + 1}. {questions[reviewQuestionIndex].prompt}
                            </p>
                        </div>

                        <div className="mt-4 space-y-3">
                            {questions[reviewQuestionIndex].options.map((option, optionIndex) => (
                                <QuizOptionButton
                                    key={option}
                                    label={option}
                                    optionIndex={optionIndex}
                                    selectedOptionIndex={selectedAnswers[questions[reviewQuestionIndex].id] ?? null}
                                    isReviewMode
                                    question={questions[reviewQuestionIndex]}
                                    onClick={() => { }}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
