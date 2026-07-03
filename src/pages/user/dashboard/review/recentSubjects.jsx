import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClockIcon from '../../../../assets/icons/Clock Circle.svg';
import {
    formatDuration,
    getRecentReviewActivities,
    subscribeReviewActivities,
} from '../../../../services/reviewActivityService';
import { useSubjects } from '../../../../contexts/SubjectsContext';

const TYPE_LABELS = {
    summary: 'Tóm tắt',
    quiz: 'Trắc nghiệm',
    flashcard: 'Flashcard',
};

function getActivityPath(activity) {
    const basePath = `/review/${activity.subjectId}/choose-method/${activity.exerciseId}`;

    if (activity.type === 'summary') return `${basePath}/summary-review`;
    if (activity.type === 'quiz') return `${basePath}/practice-multiple-choice-tests`;
    if (activity.type === 'flashcard') return `${basePath}/flashcard`;
    return basePath;
}

function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Vừa xong';

    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function RecentReviewCard({ activity, onClick }) {
    const isScoreActivity = activity.type === 'quiz' || activity.type === 'flashcard';

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex cursor-pointer flex-col gap-4 rounded-[14px] border border-[#efeefc] bg-white px-4 py-4 text-left shadow-[0_8px_22px_rgba(17,24,39,0.03)] transition-colors hover:bg-[#f7f6ff] sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_100px_110px] sm:items-center sm:gap-4 sm:px-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px_120px]"
        >
            <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-[#212121]">
                    {activity.exerciseTitle}
                </p>
                <p className="mt-1 truncate text-[13px] text-[#858494]">
                    {activity.subjectTitle}
                </p>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 sm:block">
                <span className="inline-flex max-w-full rounded-full bg-[#edeafe] px-3 py-1 text-[12px] font-semibold leading-4 text-[#6A5AE0]">
                    {TYPE_LABELS[activity.type] ?? 'Ôn tập'}
                </span>
                <p className="flex items-center gap-1.5 text-[12px] text-[#858494] sm:mt-2">
                    <img src={ClockIcon} alt="" aria-hidden="true" className="h-4 w-4" />
                    {formatDuration(activity.durationSeconds)}
                </p>
            </div>

            <div className="min-w-0">
                <p className="text-[13px] text-[#858494]">Kết quả</p>
                <p className="mt-1 text-[15px] font-semibold text-[#212121]">
                    {isScoreActivity ? `${activity.correctCount}/${activity.totalItems}` : `${activity.progress}%`}
                </p>
            </div>

            <div className="min-w-0">
                <p className="text-[13px] text-[#858494]">Thời điểm</p>
                <p className="mt-1 text-[13px] font-medium text-[#212121]">
                    {formatDateTime(activity.completedAt)}
                </p>
            </div>
        </button>
    );
}

export default function RecentSubjects() {
    const navigate = useNavigate();
    const { getSubjectById } = useSubjects();
    const [refreshToken, setRefreshToken] = useState(0);
    const recentActivities = useMemo(() => getRecentReviewActivities(12), [refreshToken]);

    useEffect(() => subscribeReviewActivities(() => {
        setRefreshToken((currentToken) => currentToken + 1);
    }), []);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="mt-2 flex items-center justify-between gap-6">
                <h2 className="text-[18px] font-semibold leading-6 text-[#16151c]">
                    Đã ôn tập gần đây
                </h2>

                <p className="pt-2 text-[14px] font-light leading-6 text-[#a2a1a8]">
                    {recentActivities.length} lượt ôn tập
                </p>
            </div>

            <div className="thin-scrollbar mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-2">
                {recentActivities.length === 0 ? (
                    <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFF] text-[16px] font-light leading-6 text-[#a2a1a8]">
                        Chưa có môn ôn tập gần đây
                    </div>
                ) : null}

                {recentActivities.map((activity) => {
                    const contextSubject = getSubjectById(activity.subjectId);
                    const fallbackExercise = {
                        id: activity.exerciseId,
                        title: activity.exerciseTitle,
                        documentId: activity.documentId,
                        latestAttemptedAt: 'Hôm nay',
                        progress: activity.progress,
                    };
                    const exercise = contextSubject?.exercises?.find((item) => item.id === activity.exerciseId)
                        ?? fallbackExercise;
                    const subject = contextSubject ?? {
                        id: activity.subjectId,
                        title: activity.subjectTitle,
                        name: activity.subjectTitle,
                        subjectCode: activity.subjectCode,
                        exercises: [exercise],
                    };

                    return (
                        <RecentReviewCard
                            key={activity.id}
                            activity={activity}
                            onClick={() => navigate(getActivityPath(activity), {
                                state: {
                                    subject,
                                    exercise,
                                },
                            })}
                        />
                    );
                })}
            </div>
        </div>
    );
}
