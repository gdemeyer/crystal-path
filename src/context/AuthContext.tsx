import React, { createContext, useCallback, useEffect, useState, ReactNode } from 'react';
import authenticate from '../services/functions-authenticate.ts';

export interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    userId: string | null;
    login: (googleToken: string) => Promise<void>;
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

    const login = useCallback(async (googleToken: string) => {
        try {
            // Exchange Google/demo token for a backend-issued JWT
            const { token: backendToken, userId: backendUserId } = await authenticate(googleToken);

            setToken(backendToken);
            setIsAuthenticated(true);
            setUserId(backendUserId);

            // Store backend JWT in localStorage
            localStorage.setItem('auth_token', backendToken);
            localStorage.setItem('auth_login_time', String(Date.now()));
            if (backendUserId) {
                localStorage.setItem('user_id', backendUserId);
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            // Ensure we're in a clean state
            setToken(null);
            setIsAuthenticated(false);
            setUserId(null);
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
