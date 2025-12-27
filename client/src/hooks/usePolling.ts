import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
    interval?: number; // milliseconds, default 60000 (60 seconds)
    enabled?: boolean; // whether polling is enabled, default true
    onError?: (error: Error) => void;
}

/**
 * Hook for polling data at regular intervals
 * 
 * @example
 * const { startPolling, stopPolling, isPolling } = usePolling(
 *   async () => {
 *     const data = await api.getData();
 *     setData(data);
 *   },
 *   { interval: 60000, enabled: true }
 * );
 */
export function usePolling(
    fetchFn: () => Promise<void>,
    options: UsePollingOptions = {}
) {
    const {
        interval = 60000, // 60 seconds default
        enabled = true,
        onError
    } = options;

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startPolling = useCallback(() => {
        stopPolling(); // Clear any existing interval

        if (!enabled) return;

        // Start polling
        intervalRef.current = setInterval(async () => {
            if (!isMountedRef.current) return;

            try {
                await fetchFn();
            } catch (error) {
                if (onError) {
                    onError(error as Error);
                } else {
                    console.error('Polling error:', error);
                }
            }
        }, interval);
    }, [fetchFn, interval, enabled, onError, stopPolling]);

    // Start/stop polling based on enabled flag
    useEffect(() => {
        if (enabled) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
        };
    }, [enabled, startPolling, stopPolling]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            stopPolling();
        };
    }, [stopPolling]);

    return {
        startPolling,
        stopPolling,
        isPolling: intervalRef.current !== null
    };
}
