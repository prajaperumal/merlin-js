import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Movie, Watchstream, StreamingPlatform } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { PlatformSelector } from './PlatformSelector';
import styles from './AddToWatchstreamModal.module.css';

interface AddToWatchstreamModalProps {
    isOpen: boolean;
    onClose: () => void;
    movie: Movie;
    onSuccess?: () => void;
}

export function AddToWatchstreamModal({ isOpen, onClose, movie, onSuccess }: AddToWatchstreamModalProps) {
    const [watchstreams, setWatchstreams] = useState<Watchstream[]>([]);
    const [selectedWatchstream, setSelectedWatchstream] = useState<number | null>(null);
    const [watchStatus, setWatchStatus] = useState<'backlog' | 'watched'>('backlog');
    const [streamingPlatforms, setStreamingPlatforms] = useState<StreamingPlatform[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadWatchstreams();
        }
    }, [isOpen]);

    const loadWatchstreams = async () => {
        try {
            const data = await api.getWatchstreams();
            setWatchstreams(data);
            if (data.length > 0) {
                setSelectedWatchstream(data[0].id);
            }
        } catch (error) {
            console.error('Error loading watchstreams:', error);
        }
    };

    const handleSubmit = async () => {
        if (!selectedWatchstream) return;

        setLoading(true);
        try {
            await api.addMovieToWatchstream(
                selectedWatchstream,
                movie.tmdbId,
                watchStatus,
                streamingPlatforms.length > 0 ? streamingPlatforms : undefined
            );
            onSuccess?.();
        } catch (error) {
            console.error('Error adding to watchstream:', error);
            alert('Failed to add movie to watchstream');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedWatchstream(null);
        setWatchStatus('backlog');
        setStreamingPlatforms([]);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Add "${movie.title}" to Watchstream`}
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!selectedWatchstream || loading}>
                        {loading ? 'Adding...' : 'Add Movie'}
                    </Button>
                </>
            }
        >
            <div className={styles.content}>
                <div className={styles.formGroup}>
                    <label>Watchstream</label>
                    <select
                        value={selectedWatchstream || ''}
                        onChange={(e) => setSelectedWatchstream(parseInt(e.target.value))}
                        className={styles.select}
                    >
                        {watchstreams.map((ws) => (
                            <option key={ws.id} value={ws.id}>
                                {ws.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Status</label>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                value="backlog"
                                checked={watchStatus === 'backlog'}
                                onChange={(e) => setWatchStatus(e.target.value as 'backlog' | 'watched')}
                            />
                            <span>Backlog</span>
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                value="watched"
                                checked={watchStatus === 'watched'}
                                onChange={(e) => setWatchStatus(e.target.value as 'backlog' | 'watched')}
                            />
                            <span>Watched</span>
                        </label>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Streaming Platforms (Optional)</label>
                    <PlatformSelector
                        selectedPlatforms={streamingPlatforms}
                        onChange={setStreamingPlatforms}
                    />
                </div>
            </div>
        </Modal>
    );
}
