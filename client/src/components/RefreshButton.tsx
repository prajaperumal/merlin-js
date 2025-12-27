import { Icon } from './ui/Icon';
import styles from './RefreshButton.module.css';

interface RefreshButtonProps {
    onRefresh: () => void | Promise<void>;
    loading?: boolean;
    className?: string;
}

export function RefreshButton({ onRefresh, loading = false, className = '' }: RefreshButtonProps) {
    return (
        <button
            onClick={onRefresh}
            disabled={loading}
            className={`${styles.refreshButton} ${loading ? styles.loading : ''} ${className}`}
            title="Refresh"
            aria-label="Refresh data"
        >
            {/* Using airplay icon as a temporary refresh icon */}
            <Icon name="airplay" size="medium" />
        </button>
    );
}
