import { useState, useCallback } from 'react';

/**
 * Hook for managing optimistic updates with automatic rollback on error
 * 
 * @example
 * const [items, { add, remove, update }] = useOptimisticState(initialItems);
 * 
 * // Optimistically add item
 * await add(newItem, async () => {
 *   await api.addItem(newItem);
 * });
 */
export function useOptimisticState<T>(initialState: T[]) {
    const [state, setState] = useState<T[]>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Optimistically add an item
     */
    const add = useCallback(async (
        item: T,
        apiCall: () => Promise<void>,
        options?: { prepend?: boolean }
    ) => {
        const previousState = [...state];
        setIsLoading(true);
        setError(null);

        try {
            // Optimistically update UI
            setState(prev => options?.prepend ? [item, ...prev] : [...prev, item]);

            // Make API call
            await apiCall();
        } catch (err) {
            // Rollback on error
            setState(previousState);
            setError(err as Error);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [state]);

    /**
     * Optimistically remove an item
     */
    const remove = useCallback(async (
        predicate: (item: T) => boolean,
        apiCall: () => Promise<void>
    ) => {
        const previousState = [...state];
        setIsLoading(true);
        setError(null);

        try {
            // Optimistically update UI
            setState(prev => prev.filter(item => !predicate(item)));

            // Make API call
            await apiCall();
        } catch (err) {
            // Rollback on error
            setState(previousState);
            setError(err as Error);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [state]);

    /**
     * Optimistically update an item
     */
    const update = useCallback(async (
        predicate: (item: T) => boolean,
        updater: (item: T) => T,
        apiCall: () => Promise<void>
    ) => {
        const previousState = [...state];
        setIsLoading(true);
        setError(null);

        try {
            // Optimistically update UI
            setState(prev => prev.map(item =>
                predicate(item) ? updater(item) : item
            ));

            // Make API call
            await apiCall();
        } catch (err) {
            // Rollback on error
            setState(previousState);
            setError(err as Error);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [state]);

    /**
     * Replace entire state (useful for refresh)
     */
    const replace = useCallback((newState: T[]) => {
        setState(newState);
    }, []);

    return [
        state,
        { add, remove, update, replace, isLoading, error }
    ] as const;
}
