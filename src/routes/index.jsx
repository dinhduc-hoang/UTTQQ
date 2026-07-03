import { authRoutes, PublicOnlyRoute } from './AuthRoute';
import { userRoutes } from './UserRouter';
import LandingPage from '../layouts/user/landingPage';

export const landingRoutes = [
    {
        path: '/landing',
        element: (
            <PublicOnlyRoute>
                <LandingPage />
            </PublicOnlyRoute>
        ),
    },
];

const routes = [...authRoutes, ...userRoutes, ...landingRoutes];

export default routes;
