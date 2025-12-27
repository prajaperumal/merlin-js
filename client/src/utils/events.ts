/**
 * Simple event bus for cross-component communication
 * Uses browser's CustomEvent API for lightweight pub/sub
 */

export const events = {
    /**
     * Emit an event
     */
    emit(eventName: string, detail?: any) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    },

    /**
     * Listen to an event
     */
    on(eventName: string, handler: (event: CustomEvent) => void) {
        window.addEventListener(eventName, handler as EventListener);

        // Return cleanup function
        return () => {
            window.removeEventListener(eventName, handler as EventListener);
        };
    }
};

// Event names
export const EVENT_NAMES = {
    CIRCLE_MOVIE_ADDED: 'circle:movie:added',
    WATCHSTREAM_MOVIE_ADDED: 'watchstream:movie:added',
    CIRCLE_UPDATED: 'circle:updated',
    WATCHSTREAM_UPDATED: 'watchstream:updated',
} as const;
