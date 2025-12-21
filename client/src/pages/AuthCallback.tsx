import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const processingRef = React.useRef(false);

    useEffect(() => {
        const handleCallback = async () => {
            if (processingRef.current) return;
            processingRef.current = true;

            const code = searchParams.get('code');

            if (!code) {
                console.error('No authorization code received');
                navigate('/');
                return;
            }

            try {
                // Send the code to the backend
                await api.handleGoogleCallback(code);

                // Refresh user state
                await refreshUser();

                // Redirect to home
                navigate('/');
            } catch (error) {
                console.error('Authentication failed:', error);
                navigate('/');
            }
        };

        handleCallback();
    }, [searchParams, navigate, refreshUser]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            color: 'var(--color-text-secondary)',
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
                <p>Completing sign in...</p>
            </div>
        </div>
    );
}
