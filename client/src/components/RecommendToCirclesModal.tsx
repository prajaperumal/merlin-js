import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Movie, Circle } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import styles from './RecommendToCirclesModal.module.css';

interface RecommendToCirclesModalProps {
    isOpen: boolean;
    onClose: () => void;
    movie: Movie;
    onSuccess?: () => void;
    existingCircleIds?: number[];
}

export function RecommendToCirclesModal({ isOpen, onClose, movie, onSuccess, existingCircleIds = [] }: RecommendToCirclesModalProps) {
    const [circles, setCircles] = useState<Circle[]>([]);
    const [selectedCircles, setSelectedCircles] = useState<Set<number>>(new Set());
    const [recommendation, setRecommendation] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadCircles();
            setSelectedCircles(new Set(existingCircleIds));
        }
    }, [isOpen]);

    const loadCircles = async () => {
        try {
            const data = await api.getCircles();
            const allCircles = [...data.owned, ...data.member];
            setCircles(allCircles);
        } catch (error) {
            console.error('Error loading circles:', error);
        }
    };

    const toggleCircle = (circleId: number) => {
        if (existingCircleIds.includes(circleId)) return;

        const newSelection = new Set(selectedCircles);
        if (newSelection.has(circleId)) {
            newSelection.delete(circleId);
        } else {
            newSelection.add(circleId);
        }
        setSelectedCircles(newSelection);
    };

    const handleSubmit = async () => {
        if (selectedCircles.size === 0) return;

        setLoading(true);
        try {
            const newCirclesToRecommend = Array.from(selectedCircles).filter(
                id => !existingCircleIds.includes(id)
            );

            await Promise.all(
                newCirclesToRecommend.map(circleId =>
                    api.addMovieToCircle(
                        circleId,
                        movie.tmdbId,
                        recommendation || undefined
                    )
                )
            );
            onSuccess?.();
        } catch (error) {
            console.error('Error recommending to circles:', error);
            alert('Failed to recommend movie to circles');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedCircles(new Set());
        setRecommendation('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Recommend "${movie.title}" to Circles`}
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || Array.from(selectedCircles).filter(id => !existingCircleIds.includes(id)).length === 0}>
                        {loading ? 'Recommending...' : `Recommend to ${Array.from(selectedCircles).filter(id => !existingCircleIds.includes(id)).length} ${Array.from(selectedCircles).filter(id => !existingCircleIds.includes(id)).length === 1 ? 'Circle' : 'Circles'}`}
                    </Button>
                </>
            }
        >
            <div className={styles.content}>
                <div className={styles.formGroup}>
                    <label>Select Circles</label>
                    <div className={styles.circlesList}>
                        {circles.length === 0 ? (
                            <p className={styles.noCircles}>No circles available</p>
                        ) : (
                            circles.map((circle) => {
                                const isSelected = selectedCircles.has(circle.id);
                                const isExisting = existingCircleIds.includes(circle.id);
                                return (
                                    <div
                                        key={circle.id}
                                        className={`${styles.circleOption} ${isSelected ? styles.circleOptionSelected : ''} ${isExisting ? styles.circleOptionDisabled : ''}`}
                                        onClick={() => toggleCircle(circle.id)}
                                    >
                                        <div className={styles.circleIcon}>
                                            <Icon name="users" size="medium" />
                                        </div>
                                        <span className={styles.circleName}>{circle.name}</span>
                                        {isExisting && <span className={styles.alreadyPresentText}>Already Shared</span>}
                                        {circle.isOwner && <span className={styles.ownerBadge}>Owner</span>}
                                        {isSelected && (
                                            <div className={`${styles.checkBadge} ${isExisting ? styles.checkBadgeDisabled : ''}`}>
                                                <Icon name="check-circle" size="small" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Recommendation Message (Optional)</label>
                    <textarea
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                        placeholder="Why are you recommending this movie?"
                        className={styles.textarea}
                        rows={3}
                    />
                </div>
            </div>
        </Modal>
    );
}
