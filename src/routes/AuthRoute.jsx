/* eslint-disable react-refresh/only-export-components */
import { Navigate } from 'react-router-dom';
import MainLayout from '../layouts/auth/MainLayout';
import Login from '../pages/auth/Login';
import Onboard from '../pages/auth/Onboard';
import Register from '../pages/auth/Register';
import { getStoredAuth } from '../services/authService';

export function PublicOnlyRoute({ children }) {
    const isAuthenticated = Boolean(getStoredAuth()?.accessToken);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

const withAuthLayout = (page) => (
    <PublicOnlyRoute>
        <MainLayout>{page}</MainLayout>
    </PublicOnlyRoute>
);

const authPages = [
    { path: '/login', page: <Login /> },
    { path: '/onboard', page: <Onboard /> },
    { path: '/register', page: <Register /> }
];

export const authRoutes = authPages.map(({ path, page }) => ({
    path,
    element: withAuthLayout(page),
})).concat({
    path: '*',
    element: (
        <PublicOnlyRoute>
            <Navigate to="/login" replace />
        </PublicOnlyRoute>
    ),
});

export default authRoutes;
