import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import './LoginPage.css';

declare global {
    interface Window {
        google?: {
            accounts?: {
                id?: {
                    initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
                    renderButton: (element: HTMLElement | null, options: Record<string, unknown>) => void;
                }
            }
        }
    }
}

const isLocalDev = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
};

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [error, setError] = useState<string>('');

    const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
        try {
            setError('');
            await login(response.credential);
            // Redirect to main app (handled by App.tsx)
        } catch (err) {
            setError('Failed to authenticate with Google');
            console.error(err);
        }
    }, [login]);

    React.useEffect(() => {
        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
            if (window.google?.accounts?.id && process.env.REACT_APP_GOOGLE_CLIENT_ID) {
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });

                const buttonContainer = document.getElementById('google-button-container');
                if (buttonContainer && (!process.env.REACT_APP_AUTH_ENABLED || process.env.REACT_APP_AUTH_ENABLED === 'true')) {
                    window.google.accounts.id.renderButton(
                        buttonContainer,
                        {
                            theme: 'dark',
                            size: 'large',
                            text: 'signin_with',
                        }
                    );
                }
            }
        };

        return () => {
            document.head.removeChild(script);
        };
    }, [handleGoogleResponse]);

    const handleDemoLogin = async () => {
        try {
            setError('');
            const demoToken = `dummy-token-${Date.now()}`;
            await login(demoToken);
            // Redirect to main app (handled by App.tsx)
        } catch (err) {
            setError('Failed to authenticate with demo account');
            console.error(err);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1 className="login-title">Crystal Path</h1>
                <p className="login-subtitle">Task Prioritization & Scoring</p>

                <div className="login-content">
                    {error && <div className="login-error">{error}</div>}

                    {/* Show Google login if auth is enabled */}
                    {process.env.REACT_APP_AUTH_ENABLED !== 'false' && (
                        <div className="login-section">
                            <p className="login-label">Sign in with your Google account</p>
                            <div id="google-button-container" className="google-button-container"></div>
                        </div>
                    )}

                    {/* Show demo login only in local development */}
                    {isLocalDev() && (
                        <>
                            {process.env.REACT_APP_AUTH_ENABLED !== 'false' && (
                                <div className="login-divider">or</div>
                            )}
                            <div className="login-section">
                                <button
                                    onClick={handleDemoLogin}
                                    className="demo-login-button"
                                >
                                    Use Demo Account
                                </button>
                                <p className="demo-info">
                                    Development mode: Using demo authentication
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <footer className="login-footer">
                    <p>Your tasks are private and only visible when logged in.</p>
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;
