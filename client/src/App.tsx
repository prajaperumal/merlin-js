import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Watchstreams } from './pages/Watchstreams';
import { WatchstreamDetail } from './pages/WatchstreamDetail';
import { Circles } from './pages/Circles';
import { CircleDetail } from './pages/CircleDetail';
import { AuthCallback } from './pages/AuthCallback';
import styles from './App.module.css';


function AppContent() {
    const { loading } = useAuth();
    const location = useLocation();
    const [homeMode, setHomeMode] = useState<'discover' | 'watchstream'>('discover');
    const [discoverCount, setDiscoverCount] = useState(0);
    const [watchstreamsCount, setWatchstreamsCount] = useState(0);

    const handleCountsChange = useCallback((discover: number, watchstreams: number) => {
        setDiscoverCount(discover);
        setWatchstreamsCount(watchstreams);
    }, []);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                color: 'var(--color-text-secondary)'
            }}>
                Loading...
            </div>
        );
    }

    const isHomePage = location.pathname === '/';

    return (
        <div className={styles.layout}>
            <Header
                mode={isHomePage ? homeMode : undefined}
                onModeChange={isHomePage ? setHomeMode : undefined}
                discoverCount={discoverCount}
                watchstreamsCount={watchstreamsCount}
            />
            <main className={styles.main}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Home
                                mode={homeMode}
                                onModeChange={setHomeMode}
                                onCountsChange={handleCountsChange}
                            />
                        }
                    />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/watchstreams" element={<Watchstreams />} />
                    <Route path="/watchstreams/:id" element={<WatchstreamDetail />} />
                    <Route path="/circles" element={<Circles />} />
                    <Route path="/circles/:id" element={<CircleDetail />} />
                </Routes>
            </main>
        </div>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}
