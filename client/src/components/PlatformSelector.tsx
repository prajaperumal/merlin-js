import { useState } from 'react';
import { StreamingPlatform } from '../types';
import { Icon } from './ui/Icon';
import styles from './PlatformSelector.module.css';

interface PlatformSelectorProps {
    selectedPlatforms: StreamingPlatform[];
    onChange: (platforms: StreamingPlatform[]) => void;
}

const AVAILABLE_PLATFORMS = [
    'Netflix',
    'Amazon Prime',
    'HBO Max',
    'Disney+',
    'Hulu',
    'Apple TV+',
    'Paramount+',
    'Peacock',
    'Showtime',
    'Max',
    'Crunchyroll',
    'YouTube',
];

const PLATFORM_COLORS: Record<string, string> = {
    'Netflix': '#E50914',
    'Amazon Prime': '#00A8E1',
    'HBO Max': '#9D34DA',
    'Disney+': '#113CCF',
    'Hulu': '#1CE783',
    'Apple TV+': '#000000',
    'Paramount+': '#0064FF',
    'Peacock': '#000000',
    'Showtime': '#D1242A',
    'Max': '#002BE7',
    'Crunchyroll': '#F47521',
    'YouTube': '#FF0000',
};

export function PlatformSelector({ selectedPlatforms, onChange }: PlatformSelectorProps) {
    const [customPlatform, setCustomPlatform] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const isPlatformSelected = (platformName: string) => {
        return selectedPlatforms.some(p => p.name === platformName);
    };

    const togglePlatform = (platformName: string) => {
        if (isPlatformSelected(platformName)) {
            onChange(selectedPlatforms.filter(p => p.name !== platformName));
        } else {
            onChange([...selectedPlatforms, { name: platformName }]);
        }
    };

    const addCustomPlatform = () => {
        if (customPlatform.trim() && !isPlatformSelected(customPlatform.trim())) {
            onChange([...selectedPlatforms, { name: customPlatform.trim() }]);
            setCustomPlatform('');
            setShowCustomInput(false);
        }
    };

    const removeCustomPlatform = (platformName: string) => {
        onChange(selectedPlatforms.filter(p => p.name !== platformName));
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>Available on (optional)</label>

            <div className={styles.platformGrid}>
                {AVAILABLE_PLATFORMS.map((platform) => (
                    <button
                        key={platform}
                        type="button"
                        className={`${styles.platformButton} ${
                            isPlatformSelected(platform) ? styles.selected : ''
                        }`}
                        onClick={() => togglePlatform(platform)}
                        style={{
                            borderColor: isPlatformSelected(platform)
                                ? PLATFORM_COLORS[platform]
                                : undefined,
                            background: isPlatformSelected(platform)
                                ? `${PLATFORM_COLORS[platform]}15`
                                : undefined,
                        }}
                    >
                        {platform}
                    </button>
                ))}
            </div>

            {!showCustomInput ? (
                <button
                    type="button"
                    className={styles.addCustomButton}
                    onClick={() => setShowCustomInput(true)}
                >
                    <Icon name="plus" size="small" />
                    Add other platform
                </button>
            ) : (
                <div className={styles.customInputWrapper}>
                    <input
                        type="text"
                        className={styles.customInput}
                        placeholder="Enter platform name"
                        value={customPlatform}
                        onChange={(e) => setCustomPlatform(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomPlatform();
                            } else if (e.key === 'Escape') {
                                setShowCustomInput(false);
                                setCustomPlatform('');
                            }
                        }}
                        autoFocus
                    />
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={addCustomPlatform}
                        disabled={!customPlatform.trim()}
                    >
                        <Icon name="check-circle" size="small" />
                    </button>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => {
                            setShowCustomInput(false);
                            setCustomPlatform('');
                        }}
                    >
                        <Icon name="x" size="small" />
                    </button>
                </div>
            )}

            {selectedPlatforms.some(p => !AVAILABLE_PLATFORMS.includes(p.name)) && (
                <div className={styles.customPlatforms}>
                    {selectedPlatforms
                        .filter(p => !AVAILABLE_PLATFORMS.includes(p.name))
                        .map((platform, index) => (
                            <div key={index} className={styles.customPlatformTag}>
                                {platform.name}
                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => removeCustomPlatform(platform.name)}
                                >
                                    <Icon name="x" size="small" />
                                </button>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
