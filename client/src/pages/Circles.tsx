import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Circle } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import styles from './Circles.module.css';

export function Circles() {
    const [ownedCircles, setOwnedCircles] = useState<Circle[]>([]);
    const [memberCircles, setMemberCircles] = useState<Circle[]>([]);
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
    };

    const handleCreate = async () => {
        await api.createCircle(newName, newDescription);
        setNewName('');
        setNewDescription('');
        setShowCreateModal(false);
        loadCircles();
    };

    return (
        <div className={styles.circles} data-theme="circle">
            <div className={styles.header}>
                <h1 className={styles.title}>My Circles</h1>
                <Button onClick={() => setShowCreateModal(true)} className={styles.createButton}>Create Circle</Button>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Owned Circles</h2>
                {ownedCircles.length > 0 ? (
                    <div className={styles.grid}>
                        {ownedCircles.map((circle) => (
                            <Link key={circle.id} to={`/circles/${circle.id}`} style={{ textDecoration: 'none' }}>
                                <Card clickable>
                                    <h3>{circle.name}</h3>
                                    {circle.description && (
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                                            {circle.description}
                                        </p>
                                    )}
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-sm)' }}>
                                        {circle.memberCount} members
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <p>No circles owned yet</p>
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Member Circles</h2>
                {memberCircles.length > 0 ? (
                    <div className={styles.grid}>
                        {memberCircles.map((circle) => (
                            <Link key={circle.id} to={`/circles/${circle.id}`} style={{ textDecoration: 'none' }}>
                                <Card clickable>
                                    <h3>{circle.name}</h3>
                                    {circle.description && (
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                                            {circle.description}
                                        </p>
                                    )}
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <p>Not a member of any circles yet</p>
                    </div>
                )}
            </div>

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
