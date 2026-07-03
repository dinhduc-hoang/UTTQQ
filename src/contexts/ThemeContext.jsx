import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = 'uttq.theme';

function getInitialTheme() {
    if (typeof window === 'undefined') return 'light';

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const setTheme = useCallback((nextTheme) => {
        setThemeState(nextTheme === 'dark' ? 'dark' : 'light');
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
    }, []);

    const value = useMemo(() => ({
        theme,
        isDark: theme === 'dark',
        setTheme,
        toggleTheme,
    }), [setTheme, theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
