import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Watchstream } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import styles from './Watchstreams.module.css';

export function Watchstreams() {
    const [watchstreams, setWatchstreams] = useState<Watchstream[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadWatchstreams();
    }, []);

    const loadWatchstreams = async () => {
        const data = await api.getWatchstreams();
        setWatchstreams(data);
    };

    const handleCreate = async () => {
        try {
            setError('');
            await api.createWatchstream(newName);
            setNewName('');
            setShowCreateModal(false);
            loadWatchstreams();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.watchstreams}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Watchstreams</h1>
                <Button onClick={() => setShowCreateModal(true)}>Create Watchstream</Button>
            </div>

            {watchstreams.length > 0 ? (
                <div className={styles.grid}>
                    {watchstreams.map((watchstream) => (
                        <Card key={watchstream.id} clickable>
                            <h3>{watchstream.name}</h3>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                                Created {new Date(watchstream.createdAt).toLocaleDateString()}
                            </p>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <p>No watchstreams yet. Create one to get started!</p>
                </div>
            )}

            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setError('');
                    setNewName('');
                }}
                title="Create Watchstream"
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
                <div>
                    <Input
                        placeholder="Watchstream name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        error={!!error}
                    />
                    {error && <p style={{ color: 'var(--color-error)', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
                </div>
            </Modal>
        </div>
    );
}
