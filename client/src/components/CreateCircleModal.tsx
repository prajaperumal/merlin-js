import { useState } from 'react';
import { Icon } from './ui/Icon';
import { Button } from './ui/Button';
import styles from './CreateCircleModal.module.css';

interface CreateCircleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string, invitedEmails: string[]) => void;
}

export function CreateCircleModal({ isOpen, onClose, onCreate }: CreateCircleModalProps) {
    const [circleName, setCircleName] = useState('');
    const [tagline, setTagline] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleAddEmail = () => {
        const emails = emailInput.split(',').map(e => e.trim()).filter(e => e);
        if (emails.length > 0) {
            setInvitedEmails([...invitedEmails, ...emails]);
            setEmailInput('');
        }
    };

    const handleRemoveEmail = (email: string) => {
        setInvitedEmails(invitedEmails.filter(e => e !== email));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (circleName.trim()) {
            onCreate(circleName.trim(), tagline.trim(), invitedEmails);
            // Reset form
            setCircleName('');
            setTagline('');
            setEmailInput('');
            setInvitedEmails([]);
        }
    };

    const handleClose = () => {
        setCircleName('');
        setTagline('');
        setEmailInput('');
        setInvitedEmails([]);
        onClose();
    };

    const getAvatarColor = (index: number) => {
        const colors = ['#a855f7', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];
        return colors[index % colors.length];
    };

    const getInitials = (email: string) => {
        const name = email.split('@')[0];
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Create New Circle</h2>
                        <p className={styles.subtitle}>Create a movie circle to share and discover films with friends</p>
                    </div>
                    <button className={styles.closeButton} onClick={handleClose}>
                        <Icon name="x" size="small" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Circle Details Section */}
                    <div className={styles.stepIndicator}>
                        <div className={styles.stepBadgeInfo}>
                            <Icon name="info" size="small" />
                        </div>
                        <span className={styles.stepLabel}>Circle Details</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Circle Name <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g., Friday Night Movies, Sci-Fi Fans, Classic Cinema Club..."
                            value={circleName}
                            onChange={(e) => setCircleName(e.target.value)}
                            autoFocus
                        />
                        <p className={styles.helperText}>
                            Choose a name that reflects your movie circle's theme or vibe
                        </p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tagline</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="A short description of your movie circle's focus..."
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                        />
                        <p className={styles.helperText}>
                            A catchy tagline helps others understand your movie taste at a glance
                        </p>
                    </div>

                    {/* Invite Members Section */}
                    <div className={styles.stepIndicator}>
                        <div className={styles.stepBadgeInfo}>
                            <Icon name="user-add" size="small" />
                        </div>
                        <span className={styles.stepLabel}>Invite Members</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Add members by email</label>
                        <div className={styles.emailInputRow}>
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="Enter email address..."
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddEmail();
                                    }
                                }}
                            />
                            <Button type="button" variant="primary" onClick={handleAddEmail}>
                                <Icon name="plus" size="small" />
                                Add
                            </Button>
                        </div>
                        <p className={styles.helperText}>
                            You can invite multiple members at once by separating emails with commas
                        </p>
                    </div>

                    {invitedEmails.length > 0 && (
                        <div className={styles.invitedList}>
                            {invitedEmails.map((email, index) => (
                                <div key={email} className={styles.invitedItem}>
                                    <div className={styles.invitedAvatar} style={{ background: getAvatarColor(index) }}>
                                        {getInitials(email)}
                                    </div>
                                    <div className={styles.invitedInfo}>
                                        <div className={styles.invitedEmail}>{email}</div>
                                        <div className={styles.invitedStatus}>
                                            <Icon name="message-circle" size="small" />
                                            Invitation pending
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveEmail(email)}
                                    >
                                        <Icon name="x" size="small" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* More ways to invite Section */}
                    <div className={styles.moreWaysSection}>
                        <div className={styles.stepIndicator}>
                            <div className={styles.stepBadgeInfo}>
                                <Icon name="bulb" size="small" />
                            </div>
                            <span className={styles.stepLabel}>More ways to invite</span>
                        </div>

                        <div className={styles.inviteButtonsRow}>
                            <button type="button" className={styles.inviteOptionButton}>
                                <Icon name="link" size="small" />
                                Copy Invite Link
                            </button>
                            <button type="button" className={styles.inviteOptionButton}>
                                <Icon name="qr-code" size="small" />
                                Generate QR Code
                            </button>
                        </div>

                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <div className={styles.statNumber} style={{ color: '#a855f7' }}>{invitedEmails.length}</div>
                                <div className={styles.statLabel}>Pending Invites</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statNumber} style={{ color: '#10b981' }}>0</div>
                                <div className={styles.statLabel}>Accepted</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statNumber} style={{ color: '#9ca3af' }}>0</div>
                                <div className={styles.statLabel}>Declined</div>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Personal invitation message (optional)</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Add a personal message about why you're inviting them to this movie circle..."
                                rows={4}
                            />
                            <p className={styles.helperText}>
                                This message will be included in all invitation emails
                            </p>
                        </div>
                    </div>

                    {/* Invitation Notifications Section */}
                    <div className={styles.notificationsSection}>
                        <div className={styles.stepIndicator}>
                            <div className={styles.stepBadgeInfo} style={{ background: '#d1fae5', color: '#10b981' }}>
                                <Icon name="message-circle" size="small" />
                            </div>
                            <span className={styles.stepLabel}>Invitation Notifications</span>
                        </div>

                        <div className={styles.notificationOption}>
                            <div className={styles.notificationIconWrapper}>
                                <Icon name="message-circle" size="small" />
                            </div>
                            <div className={styles.notificationContent}>
                                <div className={styles.notificationTitle}>Send email invitations</div>
                                <div className={styles.notificationDescription}>Members will receive an email with invitation link</div>
                            </div>
                            <label className={styles.toggleSwitch}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        <div className={styles.notificationOption}>
                            <div className={styles.notificationIconWrapper}>
                                <Icon name="message-circle" size="small" />
                            </div>
                            <div className={styles.notificationContent}>
                                <div className={styles.notificationTitle}>Send reminder after 3 days</div>
                                <div className={styles.notificationDescription}>Automatically remind members who haven't responded</div>
                            </div>
                            <label className={styles.toggleSwitch}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        <div className={styles.notificationOption}>
                            <div className={styles.notificationIconWrapper}>
                                <Icon name="user-add" size="small" />
                            </div>
                            <div className={styles.notificationContent}>
                                <div className={styles.notificationTitle}>Notify me when someone joins</div>
                                <div className={styles.notificationDescription}>Get notified when invitations are accepted</div>
                            </div>
                            <label className={styles.toggleSwitch}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelButton} onClick={handleClose}>
                            Cancel
                        </button>
                        <div className={styles.actionButtons}>
                            <button type="button" className={styles.secondaryActionButton}>
                                <Icon name="send" size="small" />
                                Send Invitations Later
                            </button>
                            <Button type="submit" variant="primary" disabled={!circleName.trim()}>
                                <Icon name="check-circle" size="small" />
                                Create & Send Invites
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
