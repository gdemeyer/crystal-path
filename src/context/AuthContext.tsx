import React, { createContext, useCallback, useEffect, useState, ReactNode } from 'react';

export interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    userId: string | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUserId = localStorage.getItem('user_id');
        const loginTime = localStorage.getItem('auth_login_time');

        if (storedToken) {
            // Check if login is within 2-week window
            const isExpired = !loginTime || (Date.now() - Number(loginTime)) > TWO_WEEKS_MS;

            if (isExpired) {
                // Session expired — clear everything
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('auth_login_time');
                sessionStorage.clear();
            } else {
                setToken(storedToken);
                setIsAuthenticated(true);
                if (storedUserId) {
                    setUserId(storedUserId);
                }
            }
        }

        setIsLoading(false);
    }, []);

    const login = useCallback((newToken: string) => {
        // Extract userId from token if possible (for demo tokens: dummy-token-{userId})
        let extractedUserId = null;
        if (newToken.startsWith('dummy-token-')) {
            extractedUserId = newToken.replace('dummy-token-', '');
        } else {
            // For real Google tokens, userId will be set by backend on first API call
            extractedUserId = 'google-user';
        }

        setToken(newToken);
        setIsAuthenticated(true);
        setUserId(extractedUserId);

        // Store in localStorage
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_login_time', String(Date.now()));
        if (extractedUserId) {
            localStorage.setItem('user_id', extractedUserId);
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setIsAuthenticated(false);
        setUserId(null);

        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('auth_login_time');

        // Clear any cached data
        sessionStorage.clear();
    }, []);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            token,
            userId,
            login,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
