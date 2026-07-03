/* eslint-disable react-refresh/only-export-components */
import { Navigate } from 'react-router-dom';
import MainLayout from '../layouts/user/MainLayout';
import Statistical from '../pages/user/dashboard/statisticalLayout';
import Setting from '../pages/user/dashboard/setting';
import Account from '../pages/user/dashboard/account';
import { reviewRoutes } from './ReviewRoute';
import { getStoredAuth } from '../services/authService';

function RequireAuth({ children }) {
    const isAuthenticated = Boolean(getStoredAuth()?.accessToken);

    if (!isAuthenticated) {
        return <Navigate to="/landing" replace />;
    }

    return children;
}

const withUserLayout = (page) => (
    <RequireAuth>
        <MainLayout>{page}</MainLayout>
    </RequireAuth>
);

const userPages = [
    { path: '/', page: <Statistical /> },
    { path: '/statistical', page: <Statistical /> },
    { path: '/setting', page: <Setting /> },
    { path: '/account', page: <Account /> },
];

export const userRoutes = [
    ...userPages.map(({ path, page }) => ({
        path,
        element: withUserLayout(page),
    })),
    ...reviewRoutes.map((route) => ({
        ...route,
        element: <RequireAuth>{route.element}</RequireAuth>,
    })),
];

export default userRoutes;
