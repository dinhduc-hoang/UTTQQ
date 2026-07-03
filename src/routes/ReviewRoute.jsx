import React from 'react';
import MainLayout from '../layouts/user/MainLayout';
import ReviewLayout from '../pages/user/dashboard/reviewLayout';
import { SubjectsProvider } from '../contexts/SubjectsContext';
import ListSubjects from '../pages/user/dashboard/review/listSubjects';
import DetailSubject from '../pages/user/dashboard/review/detailSubject';
import ChooseMethod from '../pages/user/dashboard/review/chooseMethod';
import SummaryReview from '../pages/user/dashboard/review/summaryReview';
import PracticeMultipleChoiceTests from '../pages/user/dashboard/review/practice_multiple_choice_tests';
import FlashcardReview from '../pages/user/dashboard/review/flashcard';
import RecentSubjects from '../pages/user/dashboard/review/recentSubjects';

export const reviewRoutes = [
    {
        path: '/review',
        element: <MainLayout />,
        children: [
            {
                element: (
                    <SubjectsProvider>
                        <ReviewLayout />
                    </SubjectsProvider>
                ),
                children: [
                    {
                        index: true,
                        element: <ListSubjects />,
                    },
                    {
                        path: 'recent',
                        element: <RecentSubjects />,
                    },
                    {
                        path: ':subjectId',
                        element: <DetailSubject />,
                    },
                    {
                        path: ':subjectId/choose-method/:exerciseId',
                        element: <ChooseMethod />,
                    },
                    {
                        path: ':subjectId/choose-method/:exerciseId/summary-review',
                        element: <SummaryReview />,
                    },
                    {
                        path: ':subjectId/choose-method/:exerciseId/practice-multiple-choice-tests',
                        element: <PracticeMultipleChoiceTests />,
                    },
                    {
                        path: ':subjectId/choose-method/:exerciseId/flashcard',
                        element: <FlashcardReview />,
                    },
                    {
                        path: ':subjectId/choose-method/:exerciseId/true-false',
                        element: <FlashcardReview />,
                    },
                ],
            },
        ],
    },
];

export default reviewRoutes;
