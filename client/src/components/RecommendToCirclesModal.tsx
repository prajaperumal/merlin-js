import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Movie, Circle } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { events, EVENT_NAMES } from '../utils/events';
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
    const [filterQuery, setFilterQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadCircles();
            setSelectedCircles(new Set(existingCircleIds));
            setFilterQuery('');
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
                        movie.dataProviderId,
                        recommendation || undefined
                    )
                )
            );

            // Emit events for each circle that had a movie added
            newCirclesToRecommend.forEach(circleId => {
                events.emit(EVENT_NAMES.CIRCLE_MOVIE_ADDED, { circleId, movie });
                // Set flag in localStorage so CircleDetail page knows to refresh when navigated to
                localStorage.setItem(`circle_${circleId}_last_update`, Date.now().toString());
            });

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
        setFilterQuery('');
        onClose();
    };

    const filteredCircles = circles.filter(circle =>
        circle.name.toLowerCase().includes(filterQuery.toLowerCase())
    );

    const getCircleColor = (index: number) => {
        const colors = ['#8b5cf6', '#f97316', '#3b82f6', '#10b981', '#ec4899'];
        return colors[index % colors.length];
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Recommend to Circle"
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || Array.from(selectedCircles).filter(id => !existingCircleIds.includes(id)).length === 0}>
                        {loading ? 'Sharing...' : 'Share Recommendation'}
                    </Button>
                </>
            }
        >
            <div className={styles.content}>
                <div className={styles.formGroup}>
                    <label>Select Circle</label>
                    <input
                        type="text"
                        placeholder="Search circles..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className={styles.filterInput}
                    />
                    <div className={styles.circlesList}>
                        {filteredCircles.length === 0 ? (
                            <p className={styles.noCircles}>
                                {filterQuery ? 'No circles found' : 'No circles available'}
                            </p>
                        ) : (
                            filteredCircles.map((circle, index) => {
                                const isSelected = selectedCircles.has(circle.id);
                                const isExisting = existingCircleIds.includes(circle.id);
                                const circleColor = getCircleColor(index);
                                return (
                                    <div
                                        key={circle.id}
                                        className={`${styles.circleCard} ${isSelected ? styles.circleCardSelected : ''} ${isExisting ? styles.circleCardDisabled : ''}`}
                                        onClick={() => toggleCircle(circle.id)}
                                    >
                                        <div className={styles.circleIcon} style={{ backgroundColor: circleColor }}>
                                            <Icon name="film" size="medium" />
                                        </div>
                                        <div className={styles.circleInfo}>
                                            <span className={styles.circleName}>{circle.name}</span>
                                            <span className={styles.memberCount}>{circle.memberCount || 0} members</span>
                                        </div>
                                        {isSelected && !isExisting && (
                                            <div className={styles.checkmark}>
                                                <Icon name="check-circle" size="small" />
                                            </div>
                                        )}
                                        {isExisting && <span className={styles.alreadyShared}>Already Shared</span>}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Why do you recommend this? (Optional)</label>
                    <textarea
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                        placeholder="Share your thoughts about this movie..."
                        className={styles.textarea}
                        rows={4}
                    />
                </div>
            </div>
        </Modal>
    );
}
