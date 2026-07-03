import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackArrowIcon from '../../../../assets/icons/Arrow-Left.svg';
import ClockIcon from '../../../../assets/icons/Clock Circle.svg';
import {
    createReviewSubject,
    getReviewSubjectById,
} from '../../../../utils/reviewSubjects';
import {
    getOrCreateSummaryByDocument,
    normalizeSummary,
} from '../../../../services/summariesService';
import { useSubjects } from '../../../../contexts/SubjectsContext';
import { recordReviewActivity } from '../../../../services/reviewActivityService';

function getExerciseDocumentId(exercise) {
    return exercise?.documentId
        ?? exercise?.document?.id
        ?? exercise?.document?._id
        ?? exercise?.document?.documentId
        ?? exercise?.sourceDocumentId;
}

function getSummaryErrorMessage(error, documentId) {
    const message = error?.message || '';
    const isMissingDocument = error?.status === 404 && /document/i.test(message);

    if (isMissingDocument) {
        return `Tài liệu #${documentId} không còn tồn tại hoặc không thuộc tài khoản hiện tại. Vui lòng xóa bài tập cũ và tải lại file PDF.`;
    }

    return message || 'Không thể tải tóm tắt.';
}

function formatElapsedTime(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function SummaryReview() {
    const { subjectId, exerciseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const hasRecordedActivityRef = useRef(false);
    const { updateExercise } = useSubjects();
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [summary, setSummary] = useState(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [summaryError, setSummaryError] = useState('');

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

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, []);

    useEffect(() => {
        let isMounted = true;
        hasRecordedActivityRef.current = false;
        startTimeRef.current = Date.now();

        async function loadSummary() {
            if (!documentId) {
                setIsLoadingSummary(false);
                setSummaryError('Bài tập này chưa có mã tài liệu từ backend. Vui lòng tải lại file PDF để sinh tóm tắt.');
                return;
            }

            setIsLoadingSummary(true);
            setSummaryError('');

            try {
                const payload = await getOrCreateSummaryByDocument(documentId);
                const normalizedSummary = normalizeSummary(payload);

                if (!isMounted) return;

                if (!normalizedSummary.overview && normalizedSummary.sections.length === 0 && normalizedSummary.keyPoints.length === 0) {
                    throw new Error('Bản tóm tắt chưa có nội dung.');
                }

                setSummary(normalizedSummary);
            } catch (error) {
                if (!isMounted) return;
                setSummary(null);
                setScrollProgress(0);
                setSummaryError(getSummaryErrorMessage(error, documentId));
            } finally {
                if (isMounted) {
                    setIsLoadingSummary(false);
                }
            }
        }

        loadSummary();

        return () => {
            isMounted = false;
        };
    }, [documentId]);

    useEffect(() => {
        if (
            hasRecordedActivityRef.current
            || isLoadingSummary
            || summaryError
            || !summary
            || scrollProgress < 95
        ) {
            return;
        }

        const durationSeconds = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
        hasRecordedActivityRef.current = true;

        recordReviewActivity({
            type: 'summary',
            subjectId,
            subjectTitle,
            subjectCode: subject.subjectCode,
            exerciseId,
            exerciseTitle,
            documentId,
            startedAt: new Date(startTimeRef.current).toISOString(),
            durationSeconds,
            progress: 100,
        });
        updateExercise(subjectId, exerciseId, {
            progress: 100,
            latestAttemptedAt: 'Hôm nay',
        });
    }, [
        documentId,
        exerciseId,
        exerciseTitle,
        isLoadingSummary,
        scrollProgress,
        subject.subjectCode,
        subjectId,
        subjectTitle,
        summary,
        summaryError,
        updateExercise,
    ]);

    useEffect(() => {
        const contentElement = contentRef.current;

        if (!contentElement) {
            return undefined;
        }

        const updateScrollProgress = () => {
            const maxScroll = contentElement.scrollHeight - contentElement.clientHeight;

            if (maxScroll <= 0) {
                setScrollProgress(100);
                return;
            }

            const nextProgress = Math.round((contentElement.scrollTop / maxScroll) * 100);
            setScrollProgress(Math.min(100, Math.max(0, nextProgress)));
        };

        updateScrollProgress();
        contentElement.addEventListener('scroll', updateScrollProgress, { passive: true });
        window.addEventListener('resize', updateScrollProgress);

        return () => {
            contentElement.removeEventListener('scroll', updateScrollProgress);
            window.removeEventListener('resize', updateScrollProgress);
        };
    }, [isLoadingSummary, summary, summaryError]);

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

            <div className="mt-5 flex items-center justify-between gap-4">
                <h1 className="text-[20px] font-semibold leading-[1.2] text-[#6A5AE0]">
                    Ôn tập tóm tắt
                </h1>

                <div className="inline-flex h-[29px] shrink-0 items-center gap-1.5 rounded-[10px] bg-white px-2 py-px shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
                    <img src={ClockIcon} alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <p className="text-[15px] font-normal leading-normal text-[#858494]">
                        {formatElapsedTime(elapsedSeconds)}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-[#EDEFFF] shadow-[0_18px_50px_rgba(106,90,224,0.08)]">
                <div className="flex items-center justify-between gap-4 px-6 pt-5">
                    <div className="flex-1 overflow-hidden rounded-full bg-white">
                        <div
                            className="h-2.5 rounded-full bg-[linear-gradient(-8.33969deg,rgb(106,90,224)_0%,rgb(132,118,234)_100%)] transition-[width] duration-200"
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>

                    <p className="w-12 shrink-0 text-center text-[15px] font-normal leading-normal text-[#F75555]">
                        {scrollProgress}%
                    </p>
                </div>

                <div
                    ref={contentRef}
                    className="thin-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto px-6 pb-6 pr-8"
                >
                    {isLoadingSummary ? (
                        <div className="rounded-2xl bg-white/60 px-5 py-5 text-[14px] leading-7 text-[#858494] shadow-[0_1px_2px_rgba(17,24,39,0.02)]">
                            Đang tải hoặc sinh tóm tắt...
                        </div>
                    ) : summaryError ? (
                        <div className="rounded-2xl bg-[#fef2f2] px-5 py-5 text-[14px] leading-7 text-[#b42318] shadow-[0_1px_2px_rgba(17,24,39,0.02)]">
                            {summaryError}
                        </div>
                    ) : (
                        <article className="rounded-2xl bg-white/60 px-5 py-5 text-[14px] leading-7 text-[#16151c] shadow-[0_1px_2px_rgba(17,24,39,0.02)]">
                            <h2 className="text-[20px] font-semibold leading-[1.35] text-[#212121]">
                                {summary.title}
                            </h2>

                            {summary.overview ? (
                                <section className="mt-4">
                                    <h3 className="text-[15px] font-semibold text-[#6A5AE0]">Tổng quan</h3>
                                    <p className="mt-2 whitespace-pre-line text-[#3d3a4f]">{summary.overview}</p>
                                </section>
                            ) : null}

                            {summary.keyPoints.length > 0 ? (
                                <section className="mt-5">
                                    <h3 className="text-[15px] font-semibold text-[#6A5AE0]">Ý chính</h3>
                                    <ul className="mt-2 list-disc space-y-2 pl-5 text-[#3d3a4f]">
                                        {summary.keyPoints.map((point, index) => (
                                            <li key={`${point}-${index}`}>{point}</li>
                                        ))}
                                    </ul>
                                </section>
                            ) : null}

                            {summary.sections.length > 0 ? (
                                <section className="mt-5 space-y-4">
                                    {summary.sections.map((section, index) => (
                                        <div key={`${section.heading}-${index}`}>
                                            <h3 className="text-[15px] font-semibold text-[#6A5AE0]">
                                                {section.heading}
                                            </h3>
                                            <p className="mt-2 whitespace-pre-line text-[#3d3a4f]">{section.content}</p>
                                        </div>
                                    ))}
                                </section>
                            ) : null}

                            {summary.suggestedQuestions.length > 0 ? (
                                <section className="mt-5">
                                    <h3 className="text-[15px] font-semibold text-[#6A5AE0]">Câu hỏi tự ôn</h3>
                                    <ul className="mt-2 list-decimal space-y-2 pl-5 text-[#3d3a4f]">
                                        {summary.suggestedQuestions.map((question, index) => (
                                            <li key={`${question}-${index}`}>{question}</li>
                                        ))}
                                    </ul>
                                </section>
                            ) : null}
                        </article>
                    )}
                </div>
            </div>
        </div>
    );
}
