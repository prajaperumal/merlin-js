import { Icon } from './ui/Icon';
import { CircleMember } from '../types';
import styles from './CircleDetailHeader.module.css';

interface CircleDetailHeaderProps {
    circleName: string;
    description?: string;
    members: CircleMember[];
    movieCount: number;
    createdAt?: string;
    onBack: () => void;
    onInviteMembers: () => void;
    onAddMovie: () => void;
    onMenuClick: () => void;
}

export function CircleDetailHeader({
    circleName,
    description,
    members,
    movieCount,
    createdAt,
    onBack,
    onInviteMembers,
    onAddMovie,
    onMenuClick
}: CircleDetailHeaderProps) {
    const owner = members.find(m => m.isOwner);
    const createdDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerTop}>
                    <div className={styles.headerLeft}>
                        <button className={styles.backButton} onClick={onBack}>
                            <Icon name="chevron-left" size="small" />
                        </button>
                        <div>
                            <div className={styles.titleRow}>
                                <h1 className={styles.title}>{circleName}</h1>
                                <span className={styles.memberCountBadge}>{members.length} members</span>
                            </div>
                            {description && (
                                <p className={styles.subtitle}>{description}</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.inviteButton} onClick={onInviteMembers}>
                            <Icon name="users" size="small" />
                            Invite Members
                        </button>
                        <button className={styles.addMovieButton} onClick={onAddMovie}>
                            <Icon name="plus" size="small" />
                            Add Movie
                        </button>
                        <button className={styles.menuButton} onClick={onMenuClick}>
                            <Icon name="chevron-down" size="small" />
                        </button>
                    </div>
                </div>

                <div className={styles.headerBottom}>
                    <div className={styles.memberAvatars}>
                        {members.slice(0, 5).map((member, index) => (
                            <div key={member.id} className={styles.avatarWrapper} style={{ zIndex: 5 - index }}>
                                {member.picture ? (
                                    <img
                                        src={member.picture}
                                        alt={member.name || member.email}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {(member.name || member.email).charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className={styles.createdBy}>
                        Created by {owner?.name || 'Circle Owner'} {createdAt ? `on ${createdDate}` : createdDate}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button className={`${styles.tab} ${styles.tabActive}`}>
                    All Movies
                    <span className={styles.tabBadge}>{movieCount}</span>
                </button>
                <button className={styles.tab}>
                    Discussions
                    <span className={styles.tabBadgeGray}>8</span>
                </button>
                <button className={styles.tab}>
                    Members
                </button>
            </div>
        </>
    );
}
