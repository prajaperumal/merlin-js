import { useState, useCallback } from 'react';

/**
 * Hook for manual data refresh with loading state
 * 
 * @example
 * const { refresh, isRefreshing } = useRefresh(async () => {
 *   const data = await api.getData();
 *   setData(data);
 * });
 * 
 * <button onClick={refresh} disabled={isRefreshing}>
 *   {isRefreshing ? 'Refreshing...' : 'Refresh'}
 * </button>
 */
export function useRefresh(fetchFn: () => Promise<void>) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            await fetchFn();
        } catch (err) {
            setError(err as Error);
            console.error('Refresh error:', err);
            throw err;
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchFn]);

    return {
        refresh,
        isRefreshing,
        error
    };
}
