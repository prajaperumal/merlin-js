import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Movie } from '../types';
import { Icon } from './ui/Icon';
import { useAuth } from '../contexts/AuthContext';
import styles from './DiscussionDrawer.module.css';

interface DiscussionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    movie: Movie;
    circleMovieId: number;
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user: {
        id: number;
        name: string | null;
        email: string;
        picture: string | null;
    };
}

export function DiscussionDrawer({ isOpen, onClose, movie, circleMovieId }: DiscussionDrawerProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && circleMovieId) {
            loadComments();
        }
    }, [isOpen, circleMovieId]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const data = await api.getCircleMovieComments(circleMovieId);
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || sending) return;

        setSending(true);
        try {
            const comment = await api.addCircleMovieComment(circleMovieId, newComment);
            setComments(prev => [...prev, comment]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to post comment');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.drawer} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <div className={styles.movieIcon}>🎬</div>
                        <div className={styles.titleArea}>
                            <h3>Discussion</h3>
                            <p className={styles.movieTitle}>{movie.title}</p>
                        </div>
                    </div>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        <Icon name="x" size="medium" />
                    </button>
                </div>

                <div className={styles.commentsList}>
                    {loading ? (
                        <div className={styles.loading}>Loading messages...</div>
                    ) : comments.length === 0 ? (
                        <div className={styles.empty}>
                            <Icon name="message-square" size="large" className={styles.emptyIcon} />
                            <p>No messages yet.</p>
                            <p className={styles.emptySub}>Start the conversation!</p>
                        </div>
                    ) : (
                        comments.map((comment) => {
                            const isOwn = user?.id === comment.user.id;
                            return (
                                <div
                                    key={comment.id}
                                    className={`${styles.commentWrapper} ${isOwn ? styles.commentOwn : ''}`}
                                >
                                    {!isOwn && (
                                        <div className={styles.avatar}>
                                            {comment.user.picture ? (
                                                <img src={comment.user.picture} alt={comment.user.name || ''} />
                                            ) : (
                                                <div className={styles.avatarPlaceholder}>
                                                    {(comment.user.name || comment.user.email).charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className={styles.commentBody}>
                                        {!isOwn && (
                                            <span className={styles.userName}>
                                                {comment.user.name || comment.user.email}
                                            </span>
                                        )}
                                        <div className={styles.commentBubble}>
                                            {comment.content}
                                        </div>
                                        <span className={styles.timestamp}>
                                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Type a message..."
                        disabled={sending}
                        className={styles.input}
                    />
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={!newComment.trim() || sending}
                    >
                        <Icon name="send" size="medium" />
                    </button>
                </form>
            </div>
        </div>
    );
}
