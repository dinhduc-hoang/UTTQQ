import { useCallback, useState } from 'react';
import { getStoredAuth, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService';

export default function useAuth() {
	const [auth, setAuth] = useState(() => getStoredAuth());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const login = useCallback(async (credentials, options) => {
		setLoading(true);
		setError('');

		try {
			const nextAuth = await loginRequest(credentials, options);
			setAuth(nextAuth);

			return nextAuth;
		} catch (loginError) {
			setError(loginError instanceof Error ? loginError.message : 'Đăng nhập thất bại.');
			throw loginError;
		} finally {
			setLoading(false);
		}
	}, []);

	const register = useCallback(async (payload) => {
		setLoading(true);
		setError('');

		try {
			const result = await registerRequest(payload);
			return result;
		} catch (registerError) {
			setError(registerError instanceof Error ? registerError.message : 'Đăng ký thất bại.');
			throw registerError;
		} finally {
			setLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		setLoading(true);
		setError('');

		try {
			const result = await logoutRequest();
			setAuth(null);

			return result;
		} catch (logoutError) {
			setError(logoutError instanceof Error ? logoutError.message : 'Đăng xuất thất bại.');
			throw logoutError;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		auth,
		user: auth?.user ?? null,
		accessToken: auth?.accessToken ?? '',
		refreshToken: auth?.refreshToken ?? '',
		isAuthenticated: Boolean(auth?.accessToken),
		loading,
		error,
		login,
		logout,
		register,
	};
}
