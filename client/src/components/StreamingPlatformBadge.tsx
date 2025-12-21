import { StreamingPlatform } from '../types';
import styles from './StreamingPlatformBadge.module.css';

interface StreamingPlatformBadgeProps {
    platforms: StreamingPlatform[];
    size?: 'small' | 'medium' | 'large';
}

// Platform logo configurations
const PLATFORM_LOGOS: Record<string, { bg: string; color: string; abbr: string }> = {
    'Netflix': { bg: '#E50914', color: '#FFFFFF', abbr: 'NF' },
    'Amazon Prime': { bg: '#00A8E1', color: '#FFFFFF', abbr: 'PV' },
    'Prime Video': { bg: '#00A8E1', color: '#FFFFFF', abbr: 'PV' },
    'HBO Max': { bg: '#9D34DA', color: '#FFFFFF', abbr: 'HBO' },
    'HBO': { bg: '#9D34DA', color: '#FFFFFF', abbr: 'HBO' },
    'Disney+': { bg: '#113CCF', color: '#FFFFFF', abbr: 'D+' },
    'Disney Plus': { bg: '#113CCF', color: '#FFFFFF', abbr: 'D+' },
    'Hulu': { bg: '#1CE783', color: '#000000', abbr: 'Hulu' },
    'Apple TV+': { bg: '#000000', color: '#FFFFFF', abbr: 'TV+' },
    'Apple TV': { bg: '#000000', color: '#FFFFFF', abbr: 'TV+' },
    'Paramount+': { bg: '#0064FF', color: '#FFFFFF', abbr: 'P+' },
    'Peacock': { bg: '#000000', color: '#FFFFFF', abbr: 'Pck' },
    'Showtime': { bg: '#D1242A', color: '#FFFFFF', abbr: 'SHO' },
    'Starz': { bg: '#000000', color: '#FFFFFF', abbr: 'STZ' },
    'Crunchyroll': { bg: '#F47521', color: '#FFFFFF', abbr: 'CR' },
    'YouTube': { bg: '#FF0000', color: '#FFFFFF', abbr: 'YT' },
    'Max': { bg: '#002BE7', color: '#FFFFFF', abbr: 'MAX' },
};

function getPlatformConfig(platformName: string) {
    // Try exact match first
    if (PLATFORM_LOGOS[platformName]) {
        return PLATFORM_LOGOS[platformName];
    }

    // Try case-insensitive match
    const key = Object.keys(PLATFORM_LOGOS).find(
        k => k.toLowerCase() === platformName.toLowerCase()
    );
    if (key) {
        return PLATFORM_LOGOS[key];
    }

    // Default for unknown platforms
    return {
        bg: '#666666',
        color: '#FFFFFF',
        abbr: platformName.substring(0, 3).toUpperCase(),
    };
}

export function StreamingPlatformBadge({ platforms, size = 'medium' }: StreamingPlatformBadgeProps) {
    if (!platforms || platforms.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            {platforms.map((platform, index) => {
                const config = getPlatformConfig(platform.name);
                return (
                    <div
                        key={index}
                        className={`${styles.badge} ${styles[size]}`}
                        style={{
                            background: config.bg,
                            color: config.color,
                        }}
                        title={platform.name}
                    >
                        {config.abbr}
                    </div>
                );
            })}
        </div>
    );
}
