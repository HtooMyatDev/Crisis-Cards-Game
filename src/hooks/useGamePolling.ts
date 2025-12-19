import { useEffect, useRef, useState } from 'react';

interface PollingOptions {
    interval?: number;
    enabled?: boolean;
    onPoll: () => Promise<void> | void;
}

export const useGamePolling = ({
    interval = 1000,
    enabled = true,
    onPoll
}: PollingOptions) => {
    const savedCallback = useRef(onPoll);
    const [isVisible, setIsVisible] = useState(typeof document !== 'undefined' ? !document.hidden : true);

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = onPoll;
    }, [onPoll]);

    // Handle visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Set up the polling
    useEffect(() => {
        if (!enabled || !isVisible) return;

        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const tick = async () => {
            try {
                await savedCallback.current();
            } catch (error) {
                console.error('Polling error:', error);
            } finally {
                if (isMounted) {
                    // Use setTimeout instead of setInterval to prevent overlapping requests
                    timeoutId = setTimeout(tick, interval);
                }
            }
        };

        // Start the loop
        tick();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [interval, enabled, isVisible]);
};
