import { useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/lib/pusher-client';

interface PollingOptions {
    interval?: number;
    enabled?: boolean;
    gameCode?: string;
    onPoll: () => Promise<void> | void;
}

export const useGamePolling = ({
    interval = 3000,
    enabled = true,
    gameCode,
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

    // Websocket Subscription (Pusher)
    useEffect(() => {
        if (!enabled || !gameCode || !process.env.NEXT_PUBLIC_PUSHER_KEY) return;

        console.log(`Subscribing to Pusher channel: game-${gameCode}`);
        const channel = pusherClient.subscribe(`game-${gameCode}`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        channel.bind('game-update', (data: any) => {
            console.log('Real-time update received:', data);
            // Trigger the poll callback immediately
            savedCallback.current();
        });

        return () => {
            pusherClient.unsubscribe(`game-${gameCode}`);
        };
    }, [gameCode, enabled]);

    // Set up the polling (Fallback & Keep-alive)
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
