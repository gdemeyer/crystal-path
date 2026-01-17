import React, { createContext, useEffect, useState, ReactNode } from 'react';

export interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    userId: string | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUserId = localStorage.getItem('user_id');

        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            if (storedUserId) {
                setUserId(storedUserId);
            }
        }

        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
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
        if (extractedUserId) {
            localStorage.setItem('user_id', extractedUserId);
        }
    };

    const logout = () => {
        setToken(null);
        setIsAuthenticated(false);
        setUserId(null);

        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');

        // Clear any cached data
        sessionStorage.clear();
    };

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
