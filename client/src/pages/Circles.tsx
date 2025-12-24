import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Circle } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import styles from './Circles.module.css';

export function Circles() {
    const [ownedCircles, setOwnedCircles] = useState<Circle[]>([]);
    const [memberCircles, setMemberCircles] = useState<Circle[]>([]);
    const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        loadCircles();
    }, []);

    const loadCircles = async () => {
        const data = await api.getCircles();
        setOwnedCircles(data.owned);
        setMemberCircles(data.member);
        setPendingInvitations(data.pendingInvitations || []);
    };

    const handleCreate = async () => {
        await api.createCircle(newName, newDescription);
        setNewName('');
        setNewDescription('');
        setShowCreateModal(false);
        loadCircles();
    };

    const handleAccept = async (circleId: number) => {
        try {
            await api.acceptInvitation(circleId);
            loadCircles();
        } catch (err) {
            console.error('Failed to accept invitation:', err);
        }
    };

    const handleDecline = async (circleId: number) => {
        try {
            await api.declineInvitation(circleId);
            loadCircles();
        } catch (err) {
            console.error('Failed to decline invitation:', err);
        }
    };

    const allCircles = [...ownedCircles.map(c => ({ ...c, isOwner: true })), ...memberCircles.map(c => ({ ...c, isOwner: false }))];

    return (
        <div className={styles.circles}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Circles</h1>
                    <div className={styles.stats}>
                        <span className={styles.statItem}>{allCircles.length} total</span>
                        <span className={styles.statDivider}>·</span>
                        <span className={styles.statItem}>{ownedCircles.length} owned</span>
                        <span className={styles.statDivider}>·</span>
                        <span className={styles.statItem}>{memberCircles.length} joined</span>
                    </div>
                </div>
                {allCircles.length > 0 && (
                    <Button onClick={() => setShowCreateModal(true)} variant="primary">
                        Create Circle
                    </Button>
                )}
            </div>

            {pendingInvitations.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Invitations</h2>
                    <div className={styles.invitationsList}>
                        {pendingInvitations.map((inv) => (
                            <div key={inv.circle.id} className={styles.invitationCard}>
                                <div className={styles.invitationInfo}>
                                    <div className={styles.invitationAvatar}>
                                        {inv.circle.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className={styles.invitationTitle}>
                                            You've been invited to join <strong>{inv.circle.name}</strong>
                                        </h3>
                                        <p className={styles.invitationMeta}>
                                            {inv.circle.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.invitationActions}>
                                    <Button size="small" variant="secondary" onClick={() => handleDecline(inv.circle.id)}>
                                        Decline
                                    </Button>
                                    <Button size="small" onClick={() => handleAccept(inv.circle.id)}>
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {allCircles.length > 0 ? (
                <div className={styles.circlesGrid}>
                    {allCircles.map((circle) => (
                        <Link key={circle.id} to={`/circles/${circle.id}`} className={styles.circleCard}>
                            <div className={styles.circleCardHeader}>
                                <div className={styles.circleAvatar}>
                                    {circle.name.charAt(0).toUpperCase()}
                                </div>
                                {circle.isOwner && (
                                    <div className={styles.ownerBadge}>Owner</div>
                                )}
                            </div>
                            <div className={styles.circleCardBody}>
                                <h3 className={styles.circleCardTitle}>{circle.name}</h3>
                                {circle.description && (
                                    <p className={styles.circleCardDescription}>{circle.description}</p>
                                )}
                            </div>
                            <div className={styles.circleCardFooter}>
                                <span className={styles.memberCount}>
                                    {circle.memberCount || 1} {(circle.memberCount || 1) === 1 ? 'member' : 'members'}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🎬</div>
                    <h3 className={styles.emptyTitle}>No circles yet</h3>
                    <p className={styles.emptyText}>
                        Create your first circle to start sharing movie recommendations with friends
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        Create Your First Circle
                    </Button>
                </div>
            )}

            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setNewName('');
                    setNewDescription('');
                }}
                title="Create Circle"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!newName}>
                            Create
                        </Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <Input
                        placeholder="Circle name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <Input
                        placeholder="Description (optional)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
}
