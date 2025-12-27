import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Circle } from '../types';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { CreateCircleModal } from '../components/CreateCircleModal';
import styles from './Circles.module.css';

export function Circles() {
    const [ownedCircles, setOwnedCircles] = useState<Circle[]>([]);
    const [memberCircles, setMemberCircles] = useState<Circle[]>([]);
    const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<'all' | 'owned' | 'member'>('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [sortType, setSortType] = useState<'name' | 'dateCreated' | 'lastUpdated'>('name');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadCircles();
    }, []);

    const loadCircles = async () => {
        const data = await api.getCircles();
        setOwnedCircles(data.owned);
        setMemberCircles(data.member);

        // Mock pending invitations data
        setPendingInvitations([
            {
                id: 1,
                circle: {
                    id: 101,
                    name: 'Sci-Fi Enthusiasts',
                    description: 'Exploring the future through science fiction cinema',
                    memberCount: 24,
                    movieCount: 67
                },
                inviter: {
                    name: 'Emma Davis',
                    avatar: 'ED'
                },
                invitedAt: '3 days ago'
            },
            {
                id: 2,
                circle: {
                    id: 102,
                    name: 'Animated Masterpieces',
                    description: 'Celebrating the art of animation from all studios',
                    memberCount: 16,
                    movieCount: 38
                },
                inviter: {
                    name: 'Lisa Anderson',
                    avatar: 'LA'
                },
                invitedAt: '5 days ago'
            }
        ]);
    };

    const handleCreateCircle = async (name: string, description: string, invitedEmails: string[]) => {
        await api.createCircle(name, description);
        setShowCreateModal(false);
        loadCircles();
    };

    const handleEditCircle = (circleId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement edit circle modal
        console.log('Edit circle:', circleId);
    };

    const handleManageMembers = (circleId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement manage members modal
        console.log('Manage members:', circleId);
    };

    const handleDeleteCircle = (circleId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement delete confirmation
        console.log('Delete circle:', circleId);
    };

    const handleInvite = (circleId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement invite modal
        console.log('Invite to circle:', circleId);
    };

    const getCircleGradient = (index: number) => {
        const gradients = [
            'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
            'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        ];
        return gradients[index % gradients.length];
    };

    const getMemberAvatarColor = (index: number) => {
        const colors = ['#a855f7', '#f97316', '#3b82f6', '#10b981', '#ef4444'];
        return colors[index % colors.length];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filterBySearch = (circles: Circle[]) => {
        if (!searchQuery.trim()) return circles;
        return circles.filter(circle =>
            circle.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const getFilteredOwnedCircles = () => {
        if (filterType === 'member') return [];
        return filterBySearch(ownedCircles);
    };

    const getFilteredMemberCircles = () => {
        if (filterType === 'owned') return [];
        return filterBySearch(memberCircles);
    };

    const getFilterLabel = () => {
        if (filterType === 'owned') return 'Owned by Me';
        if (filterType === 'member') return 'Member Only';
        return 'All Circles';
    };

    const getSortLabel = () => {
        if (sortType === 'dateCreated') return 'Sort by Date Created';
        if (sortType === 'lastUpdated') return 'Sort by Last Updated';
        return 'Sort by Name';
    };

    const sortCircles = (circles: Circle[]) => {
        const sorted = [...circles];
        if (sortType === 'name') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortType === 'dateCreated') {
            sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        } else if (sortType === 'lastUpdated') {
            sorted.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        }
        return sorted;
    };

    const filteredOwnedCircles = sortCircles(getFilteredOwnedCircles());
    const filteredMemberCircles = sortCircles(getFilteredMemberCircles());
    const allFilteredCircles = [...filteredOwnedCircles, ...filteredMemberCircles];

    return (
        <div className={styles.dashboard}>
            <div className={styles.circles}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.pageTitle}>Manage Your Circles</h1>
                        <p className={styles.pageSubtitle}>Edit circle information, manage members, or delete circles</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        <Icon name="plus" size="small" />
                        Create New Circle
                    </Button>
                </div>

                {/* Filter Controls */}
                <div className={styles.controls}>
                    <div className={styles.controlsLeft}>
                        <div className={styles.searchContainer}>
                            <Icon name="search" size="small" />
                            <input
                                type="text"
                                placeholder="Search circles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <div className={styles.filterDropdownContainer}>
                            <button
                                className={styles.filterButton}
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            >
                                <Icon name="filter" size="small" />
                                {getFilterLabel()}
                                <Icon name="chevron-down" size="small" />
                            </button>
                            {showFilterDropdown && (
                                <div className={styles.filterDropdown}>
                                    <button
                                        className={`${styles.filterOption} ${filterType === 'all' ? styles.active : ''}`}
                                        onClick={() => {
                                            setFilterType('all');
                                            setShowFilterDropdown(false);
                                        }}
                                    >
                                        {filterType === 'all' && <Icon name="check-circle" size="small" />}
                                        All Circles
                                    </button>
                                    <button
                                        className={`${styles.filterOption} ${filterType === 'owned' ? styles.active : ''}`}
                                        onClick={() => {
                                            setFilterType('owned');
                                            setShowFilterDropdown(false);
                                        }}
                                    >
                                        {filterType === 'owned' && <Icon name="check-circle" size="small" />}
                                        Owned by Me
                                    </button>
                                    <button
                                        className={`${styles.filterOption} ${filterType === 'member' ? styles.active : ''}`}
                                        onClick={() => {
                                            setFilterType('member');
                                            setShowFilterDropdown(false);
                                        }}
                                    >
                                        {filterType === 'member' && <Icon name="check-circle" size="small" />}
                                        Member Only
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={styles.filterDropdownContainer}>
                            <button
                                className={styles.filterButton}
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                            >
                                <Icon name="chevron-down" size="small" />
                                {getSortLabel()}
                            </button>
                            {showSortDropdown && (
                                <div className={styles.filterDropdown}>
                                    <button
                                        className={`${styles.filterOption} ${sortType === 'name' ? styles.active : ''}`}
                                        onClick={() => {
                                            setSortType('name');
                                            setShowSortDropdown(false);
                                        }}
                                    >
                                        {sortType === 'name' && <Icon name="check-circle" size="small" />}
                                        Sort by Name
                                    </button>
                                    <button
                                        className={`${styles.filterOption} ${sortType === 'dateCreated' ? styles.active : ''}`}
                                        onClick={() => {
                                            setSortType('dateCreated');
                                            setShowSortDropdown(false);
                                        }}
                                    >
                                        {sortType === 'dateCreated' && <Icon name="check-circle" size="small" />}
                                        Sort by Date Created
                                    </button>
                                    <button
                                        className={`${styles.filterOption} ${sortType === 'lastUpdated' ? styles.active : ''}`}
                                        onClick={() => {
                                            setSortType('lastUpdated');
                                            setShowSortDropdown(false);
                                        }}
                                    >
                                        {sortType === 'lastUpdated' && <Icon name="check-circle" size="small" />}
                                        Sort by Last Updated
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Icon name="grid" size="small" />
                            Grid View
                        </button>
                        <button
                            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <Icon name="list-unordered" size="small" />
                            List View
                        </button>
                    </div>
                </div>

                {/* Pending Invitations Section */}
                {pendingInvitations.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.invitationsHeader}>
                            <div>
                                <h2 className={styles.sectionTitle}>Pending Invitations</h2>
                                <p className={styles.sectionSubtitle}>Circles you've been invited to join</p>
                            </div>
                            <span className={styles.pendingBadge}>{pendingInvitations.length} Pending</span>
                        </div>

                        <div className={styles.invitationsGrid}>
                            {pendingInvitations.map((invitation, index) => (
                                <div key={invitation.id} className={styles.invitationCard}>
                                    <div className={styles.invitationHeader}>
                                        <div className={styles.circleIcon} style={{ background: getCircleGradient(index) }}>
                                            <Icon name="film" size="small" />
                                        </div>
                                        <div className={styles.invitationInfo}>
                                            <div className={styles.invitationTitleRow}>
                                                <h3 className={styles.circleTitle}>{invitation.circle.name}</h3>
                                                <span className={styles.newBadge}>New</span>
                                            </div>
                                            <p className={styles.circleDescription}>{invitation.circle.description}</p>
                                            <div className={styles.invitationStats}>
                                                <span className={styles.stat}>
                                                    <Icon name="users" size="small" />
                                                    {invitation.circle.memberCount} members
                                                </span>
                                                <span className={styles.stat}>
                                                    <Icon name="film" size="small" />
                                                    {invitation.circle.movieCount} movies
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.inviterInfo}>
                                        <div className={styles.inviterAvatar} style={{ background: '#6b7280' }}>
                                            {invitation.inviter.avatar}
                                        </div>
                                        <div className={styles.inviterText}>
                                            <strong>{invitation.inviter.name}</strong> invited you
                                        </div>
                                        <div className={styles.invitedTime}>{invitation.invitedAt}</div>
                                    </div>

                                    <div className={styles.invitationActions}>
                                        <button className={styles.acceptButton}>
                                            <Icon name="check-circle" size="small" />
                                            Accept
                                        </button>
                                        <button className={styles.declineButton}>
                                            <Icon name="x" size="small" />
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Owned Circles Section */}
                {filteredOwnedCircles.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h2 className={styles.sectionTitle}>
                                    Circles You Own
                                    <span className={styles.countBadge}>{filteredOwnedCircles.length} Circles</span>
                                </h2>
                                <p className={styles.sectionSubtitle}>
                                    You have full control over these circles
                                </p>
                            </div>
                        </div>

                        <div className={styles.circlesList}>
                            {filteredOwnedCircles.map((circle, index) => (
                                <div key={circle.id} className={styles.circleCard} onClick={() => navigate(`/circles/${circle.id}`)}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.circleIcon} style={{ background: getCircleGradient(index) }}>
                                            <Icon name="film" size="small" />
                                        </div>
                                        <div className={styles.circleInfo}>
                                            <div className={styles.circleTitleRow}>
                                                <h3 className={styles.circleTitle}>{circle.name}</h3>
                                                <div className={styles.badges}>
                                                    <span className={styles.ownerBadge}>Owner</span>
                                                    <span className={styles.activeBadge}>Active</span>
                                                </div>
                                            </div>
                                            <p className={styles.circleDescription}>
                                                {circle.description || 'Deep dives into cinema classics and hidden gems'}
                                            </p>
                                            <div className={styles.circleStats}>
                                                <span className={styles.stat}>
                                                    <Icon name="users" size="small" />
                                                    {circle.memberCount || 8} members
                                                </span>
                                                <span className={styles.stat}>
                                                    <Icon name="film" size="small" />
                                                    {circle.movieCount || 23} movies
                                                </span>
                                                <span className={styles.stat}>
                                                    <Icon name="check-circle" size="small" />
                                                    Created {formatDate(circle.createdAt || new Date().toISOString())}
                                                </span>
                                            </div>
                                        </div>
                                        <button className={styles.settingsButton} onClick={(e) => { e.stopPropagation(); }}>
                                            <Icon name="settings" size="small" />
                                        </button>
                                    </div>

                                    <div className={styles.membersSection}>
                                        <div className={styles.membersHeader}>
                                            <span className={styles.membersLabel}>Members</span>
                                            <button className={styles.inviteButton} onClick={(e) => handleInvite(circle.id, e)}>
                                                <Icon name="user-add" size="small" />
                                                Invite
                                            </button>
                                        </div>
                                        <div className={styles.memberAvatars}>
                                            {[0, 1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={styles.memberAvatar}
                                                    style={{ background: getMemberAvatarColor(i) }}
                                                >
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                            ))}
                                            <button className={styles.viewAllMembers}>
                                                +3 View All Members
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.cardActions}>
                                        <button className={styles.editButton} onClick={(e) => handleEditCircle(circle.id, e)}>
                                            <Icon name="settings" size="small" />
                                            Edit Circle Info
                                        </button>
                                        <button className={styles.manageMembersButton} onClick={(e) => handleManageMembers(circle.id, e)}>
                                            <Icon name="users" size="small" />
                                            Manage Members
                                        </button>
                                        <button className={styles.deleteButton} onClick={(e) => handleDeleteCircle(circle.id, e)}>
                                            <Icon name="x" size="small" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Member Circles Section */}
                {filteredMemberCircles.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h2 className={styles.sectionTitle}>
                                    Circles You Are a Member Of
                                    <span className={styles.countBadge}>{filteredMemberCircles.length} Circles</span>
                                </h2>
                                <p className={styles.sectionSubtitle}>Limited management options available</p>
                            </div>
                        </div>

                        <div className={styles.memberCirclesGrid}>
                            {filteredMemberCircles.map((circle, index) => (
                                <div key={circle.id} className={styles.memberCircleCard}>
                                    <div className={styles.memberCardHeader}>
                                        <div className={styles.circleIcon} style={{ background: getCircleGradient(index) }}>
                                            <Icon name="film" size="small" />
                                        </div>
                                        <div className={styles.memberCircleInfo}>
                                            <div className={styles.memberTitleRow}>
                                                <h3 className={styles.circleTitle}>{circle.name}</h3>
                                                <span className={styles.memberBadge}>Member</span>
                                            </div>
                                            <p className={styles.circleDescription}>
                                                {circle.description || 'Discover and share great movies together'}
                                            </p>
                                            <div className={styles.memberStats}>
                                                <span className={styles.stat}>
                                                    <Icon name="users" size="small" />
                                                    {circle.memberCount || 5} members
                                                </span>
                                                <span className={styles.stat}>
                                                    <Icon name="film" size="small" />
                                                    {circle.movieCount || 15} movies
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.memberCardOwner}>
                                        <div className={styles.ownerAvatar} style={{ background: '#a855f7' }}>
                                            {circle.ownerName ? circle.ownerName.charAt(0).toUpperCase() : 'O'}
                                        </div>
                                        <div className={styles.ownerInfo}>
                                            <div className={styles.ownerName}>{circle.ownerName || 'Circle Owner'}</div>
                                            <div className={styles.ownerLabel}>Circle Owner</div>
                                        </div>
                                    </div>

                                    <div className={styles.memberCardActions}>
                                        <button
                                            className={styles.viewCircleButton}
                                            onClick={() => navigate(`/circles/${circle.id}`)}
                                        >
                                            <Icon name="eye" size="small" />
                                            View Circle
                                        </button>
                                        <button
                                            className={styles.leaveButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // TODO: Implement leave circle
                                                console.log('Leave circle:', circle.id);
                                            }}
                                        >
                                            <Icon name="x" size="small" />
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Circle Activity Section */}
                {(filteredOwnedCircles.length > 0 || filteredMemberCircles.length > 0) && (
                    <div className={styles.section}>
                        <div className={styles.activityHeader}>
                            <div>
                                <h2 className={styles.sectionTitle}>Recent Circle Activity</h2>
                                <p className={styles.sectionSubtitle}>Latest updates from your circles</p>
                            </div>
                            <button className={styles.viewAllActivity}>
                                View All Activity →
                            </button>
                        </div>

                        <div className={styles.activityFeed}>
                            {/* Activity Item 1 - Added Movies */}
                            <div className={styles.activityItem}>
                                <div className={styles.activityAvatar} style={{ background: '#a855f7' }}>
                                    AJ
                                </div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityText}>
                                        <strong>Alex Johnson</strong> added 3 new movies to <span className={styles.circleName}>Film Critics</span>
                                        <span className={styles.activityBadge} style={{ background: '#f3e8ff', color: '#a855f7' }}>New Content</span>
                                    </div>
                                    <div className={styles.activityTime}>2 hours ago</div>
                                    <div className={styles.activityDetails}>
                                        <div className={styles.movieThumbnails}>
                                            <div className={styles.movieThumb}>🎬</div>
                                            <div className={styles.movieThumb}>🎬</div>
                                            <div className={styles.movieThumb}>🎬</div>
                                        </div>
                                        <button className={styles.activityLink}>View Movies</button>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Item 2 - Invited Members */}
                            <div className={styles.activityItem}>
                                <div className={styles.activityAvatar} style={{ background: '#f97316' }}>
                                    MC
                                </div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityText}>
                                        <strong>Michael Chen</strong> invited 2 new members to <span className={styles.circleName}>Horror Club</span>
                                        <span className={styles.activityBadge} style={{ background: '#dbeafe', color: '#3b82f6' }}>New Members</span>
                                    </div>
                                    <div className={styles.activityTime}>5 hours ago</div>
                                    <div className={styles.activityDetails}>
                                        <div className={styles.newMembers}>
                                            <div className={styles.memberAvatar} style={{ background: '#3b82f6' }}>J</div>
                                            <div className={styles.memberAvatar} style={{ background: '#10b981' }}>S</div>
                                            <span className={styles.memberText}>joined the circle</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Item 3 - Updated Description */}
                            <div className={styles.activityItem}>
                                <div className={styles.activityAvatar} style={{ background: '#10b981' }}>
                                    Y
                                </div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityText}>
                                        <strong>You</strong> updated the description for <span className={styles.circleName}>Film Critics</span>
                                        <span className={styles.activityBadge} style={{ background: '#e0f2fe', color: '#0284c7' }}>Circle Update</span>
                                    </div>
                                    <div className={styles.activityTime}>1 day ago</div>
                                </div>
                            </div>

                            {/* Activity Item 4 - Started Discussion */}
                            <div className={styles.activityItem}>
                                <div className={styles.activityAvatar} style={{ background: '#3b82f6' }}>
                                    DM
                                </div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityText}>
                                        <strong>David Martinez</strong> started a discussion in <span className={styles.circleName}>World Cinema</span>
                                        <span className={styles.activityBadge} style={{ background: '#d1fae5', color: '#10b981' }}>Discussion</span>
                                    </div>
                                    <div className={styles.activityTime}>2 days ago</div>
                                    <div className={styles.activityDetails}>
                                        <div className={styles.discussionPreview}>
                                            "What are your favorite films from South Korea? Let's discuss!"
                                        </div>
                                        <button className={styles.activityLink}>View Discussion</button>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Item 5 - Created Watchlist */}
                            <div className={styles.activityItem}>
                                <div className={styles.activityAvatar} style={{ background: '#f59e0b' }}>
                                    SW
                                </div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityText}>
                                        <strong>Sarah Williams</strong> created a watchlist in <span className={styles.circleName}>Comedy Central</span>
                                        <span className={styles.activityBadge} style={{ background: '#fef3c7', color: '#f59e0b' }}>Watchlist</span>
                                    </div>
                                    <div className={styles.activityTime}>3 days ago</div>
                                    <div className={styles.activityDetails}>
                                        <div className={styles.watchlistInfo}>
                                            📋 "Best Stand-up Comedy Specials" • 8 movies
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {allFilteredCircles.length === 0 && (
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

                <CreateCircleModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateCircle}
                />
            </div>
        </div>
    );
}
