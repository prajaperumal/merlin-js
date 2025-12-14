import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Watchstreams } from './pages/Watchstreams';
import { WatchstreamDetail } from './pages/WatchstreamDetail';
import { Circles } from './pages/Circles';
import { AuthCallback } from './pages/AuthCallback';
import styles from './App.module.css';


function AppContent() {
    const { user, loading } = useAuth();

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

    return (
        <div className={styles.layout}>
            {user && <Sidebar />}
            <main className={user ? styles.main : ''}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/watchstreams" element={<Watchstreams />} />
                    <Route path="/watchstreams/:id" element={<WatchstreamDetail />} />
                    <Route path="/circles" element={<Circles />} />
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
