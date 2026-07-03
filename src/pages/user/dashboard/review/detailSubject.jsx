import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AddExercise from '../../../../components/popup/addExercise';
import { useSubjects } from '../../../../contexts/SubjectsContext';
import {
    fetchDocumentById,
    normalizeDocument,
} from '../../../../services/documentsService';
import BackArrowIcon from '../../../../assets/icons/Arrow-Left.svg';
import AddCircleIcon from '../../../../assets/icons/Add-Circle.svg';
import StarWhiteIcon from '../../../../assets/icons/StarWhite.svg';
import CalendarCheckIcon from '../../../../assets/icons/calendar-check.svg';
import FileIcon from '../../../../assets/icons/File.svg';
import ClockIcon from '../../../../assets/icons/Clock Circle.svg';

function MetricItem({ icon, label, value }) {
    return (
        <div className="flex items-center gap-2.5">
            <img src={icon} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
            <p className="text-[16px] font-light leading-6 text-white">
                <span className="font-light">{label}</span>
                <span className="font-normal">{value}</span>
            </p>
        </div>
    );
}

function getExerciseTone(progress) {
    if (progress === 100) {
        return {
            titleColor: '#049c6b',
            percentColor: '#049c6b',
            cardClass: 'bg-[rgba(74,222,128,0.2)] border-[rgba(74,222,128,0.2)]',
            fillStyle: 'linear-gradient(-2.018556889661326deg, rgb(4, 156, 107) 0%, rgb(0, 195, 143) 100%)',
        };
    }

    if (progress === 0) {
        return {
            titleColor: '#0c092a',
            percentColor: '#9e9e9e',
            cardClass: 'bg-white border-[#efeefc]',
            fillStyle: null,
        };
    }

    if (progress < 50) {
        return {
            titleColor: '#0c092a',
            percentColor: '#f75555',
            cardClass: 'bg-white border-[rgba(247,85,85,0.2)]',
            fillStyle: 'linear-gradient(-6.586743434767868deg, rgb(247, 85, 85) 0%, rgb(255, 136, 136) 100%)',
        };
    }

    return {
        titleColor: '#0c092a',
        percentColor: '#ff981f',
        cardClass: 'bg-white border-[rgba(250,204,21,0.2)]',
        fillStyle: 'linear-gradient(-4.057076549495022deg, rgb(255, 152, 31) 0%, rgb(255, 177, 85) 100%)',
    };
}

function ExerciseCard({ exercise, onClick }) {
    const tone = getExerciseTone(exercise.progress);

    return (
        <div
            className={`flex min-h-[76px] flex-none shrink-0 cursor-pointer items-center overflow-hidden rounded-[20px] border-[1.5px] px-4 py-3 transition-shadow hover:shadow-[2px_4px_12px_0_rgba(162,161,168,0.2)] sm:h-[76px] sm:px-[30px] sm:py-0 ${tone.cardClass}`}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick?.();
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div className="flex h-[58px] w-full flex-col justify-between">
                <div className="flex items-center justify-between gap-4">
                    <p
                        className="min-w-0 max-w-[303px] truncate text-[15px] font-semibold leading-normal"
                        style={{ color: tone.titleColor }}
                    >
                        {exercise.title}
                    </p>

                    <p
                        className="w-9 text-center text-[13px] font-medium leading-[1.2]"
                        style={{ color: tone.percentColor }}
                    >
                        {exercise.progress}%
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <img src={ClockIcon} alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <p className="text-[12px] font-normal leading-normal text-[#858494]">
                        {exercise.latestAttemptedAt}
                    </p>
                </div>

                <div className="relative h-[7px] w-full overflow-hidden rounded-full bg-[#eee]">
                    {exercise.progress > 0 ? (
                        <div
                            className="absolute left-0 top-0 h-full rounded-full"
                            style={{ width: `${exercise.progress}%`, backgroundImage: tone.fillStyle }}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function createEmptySubject(subjectId) {
    return {
        id: String(subjectId ?? ''),
        title: 'Môn học',
        name: 'Môn học',
        subjectCode: String(subjectId ?? ''),
        description: '',
        unfinishedCount: 0,
        completedCount: 0,
        exercises: [],
        source: 'local',
    };
}

export default function DetailSubject() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { getSubjectById, ensureSubject, appendExercises } = useSubjects();
    const seededSubject = location.state?.id === String(subjectId) ? normalizeDocument(location.state) : null;
    const [documentDetail, setDocumentDetail] = useState(seededSubject);
    const [isLoading, setIsLoading] = useState(Boolean(subjectId && !seededSubject?.isNewSubject && seededSubject?.source !== 'local'));
    const [loadError, setLoadError] = useState('');
    const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);

    useEffect(() => {
        const fromContext = getSubjectById(subjectId);
        const isLocalSubject = location.state?.isNewSubject || fromContext?.isNewSubject || fromContext?.source === 'local';

        if (!subjectId || isLocalSubject) {
            setIsLoading(false);
            if (fromContext) {
                setDocumentDetail(fromContext);
            }
            return undefined;
        }

        let isMounted = true;

        async function loadDocumentDetail() {
            setIsLoading(true);
            setLoadError('');

            try {
                const payload = await fetchDocumentById(subjectId);
                const normalized = { ...normalizeDocument(payload), source: 'api' };

                if (!isMounted) return;

                setDocumentDetail(normalized);
                ensureSubject(normalized);
            } catch (error) {
                if (!isMounted) return;
                setLoadError(error?.message || 'Không thể tải chi tiết môn học.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadDocumentDetail();

        return () => {
            isMounted = false;
        };
    }, [ensureSubject, getSubjectById, location.state?.isNewSubject, subjectId]);

    const subject = useMemo(() => {
        const fromContext = getSubjectById(subjectId);

        if (fromContext) {
            const detailExercises = Array.isArray(documentDetail?.exercises) ? documentDetail.exercises : [];
            const contextExercises = Array.isArray(fromContext.exercises) ? fromContext.exercises : [];

            return {
                ...documentDetail,
                ...fromContext,
                name: fromContext.title ?? fromContext.name ?? documentDetail?.name,
                exercises: contextExercises.length >= detailExercises.length ? contextExercises : detailExercises,
            };
        }

        if (documentDetail) {
            return {
                ...documentDetail,
                exercises: Array.isArray(documentDetail.exercises) ? documentDetail.exercises : [],
            };
        }

        if (location.state?.id === String(subjectId)) {
            return normalizeDocument(location.state);
        }

        return createEmptySubject(subjectId);
    }, [documentDetail, getSubjectById, location.state, subjectId]);

    const handleAddExerciseSuccess = ({ exercises } = {}) => {
        const nextExercises = exercises ?? [];
        appendExercises(subjectId, nextExercises);

        if (nextExercises.length === 0) return;

        setDocumentDetail((current) => {
            const base = current ?? subject;
            const existingExercises = Array.isArray(base.exercises) ? base.exercises : [];

            return {
                ...base,
                exercises: [...existingExercises, ...nextExercises],
                fileCount: (base.fileCount ?? 0) + nextExercises.length,
            };
        });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex min-w-0 items-center gap-3 text-left cursor-pointer"
                >
                    <img src={BackArrowIcon} alt="" aria-hidden="true" className="h-7 w-7 shrink-0" />
                    <h1 className="truncate text-[18px] font-semibold leading-[1.2] text-[#212121]">
                        {subject.title || subject.name}
                    </h1>
                </button>

                <button
                    type="button"
                    onClick={() => setIsAddExerciseOpen(true)}
                    className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#6949ff] px-4 text-[15px] font-normal leading-[1.4] tracking-[0.2px] text-white shadow-[4px_8px_24px_0_rgba(77,93,250,0.25)] sm:h-9 sm:w-[111px]"
                >
                    <span>Thêm</span>
                    <img src={AddCircleIcon} alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
                </button>
            </div>

            {isLoading ? (
                <div className="mt-4 text-[14px] text-[#858494]">
                    Đang tải chi tiết môn học...
                </div>
            ) : null}

            {!isLoading && loadError && !documentDetail ? (
                <div className="mt-4 rounded-[10px] bg-[#fef2f2] px-4 py-3 text-[14px] text-[#b42318]">
                    {loadError}
                </div>
            ) : null}

            <div className="mt-5 flex min-h-0 flex-1 flex-col items-stretch gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-[30px]">
                <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[243px] lg:gap-5">
                    <div className="flex h-[177px] flex-col justify-between rounded-[10px] bg-[#7152f3] p-5">
                        <MetricItem icon={StarWhiteIcon} label="Chưa xong: " value={subject.unfinishedCount ?? 0} />
                        <MetricItem icon={CalendarCheckIcon} label="Hoàn Thành: " value={subject.completedCount ?? 0} />
                        <MetricItem icon={FileIcon} label="Mã môn: " value={subject.subjectCode} />
                    </div>

                    <p className="text-[13px] font-normal leading-normal text-[#858494]">
                        {subject.description || 'Chưa có mô tả.'}
                    </p>
                </div>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
                    <h2 className="text-[18px] font-semibold leading-[1.2] text-[#212121]">
                        Danh sách bài tập
                    </h2>

                    <div className="flex max-h-[700px] flex-col gap-3 overflow-y-auto pb-10 thin-scrollbar">
                        {subject.exercises.length === 0 ? (
                            <div className="py-5 text-[14px] text-[#858494]">
                                Chưa có bài tập nào cho môn học này.
                            </div>
                        ) : null}

                        {subject.exercises.map((exercise) => (
                            <ExerciseCard
                                key={exercise.id}
                                exercise={exercise}
                                onClick={() => navigate(`choose-method/${exercise.id}`, {
                                    state: {
                                        subject,
                                        exercise,
                                    },
                                })}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <AddExercise
                open={isAddExerciseOpen}
                onClose={() => setIsAddExerciseOpen(false)}
                onSuccess={handleAddExerciseSuccess}
                subjectId={subjectId}
            />
        </div>
    );
}
