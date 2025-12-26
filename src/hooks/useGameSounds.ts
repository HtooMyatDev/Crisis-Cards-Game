import useSound from 'use-sound';

export const useGameSounds = () => {
    // Volume defaults
    const volume = 0.5;

    // Define sounds - using .wav as requested
    // "interrupt: true" stops previous instance if played again (good for ticks)
    // "interrupt: false" allows overlap (good for joins)
    const [playJoin] = useSound('/sounds/join.wav', { volume: 0.4 });
    const [playNotification] = useSound('/sounds/notification.wav', { volume });
    const [playTick] = useSound('/sounds/tick.wav', { volume: 0.2, interrupt: true });
    const [playSuccess] = useSound('/sounds/success.wav', { volume: 0.6 });

    return {
        playJoin,
        playNotification,
        playTick,
        playSuccess
    };
};
