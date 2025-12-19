export interface PlayerValidationResult {
    valid: boolean;
    playerId?: number;
    nickname?: string;
    isLeader?: boolean;
    teamId?: string;
}

export const gameService = {
    /**
     * Fetch current game status
     */
    fetchGameStatus: async (gameCode: string) => {
        const res = await fetch(`/api/game/${gameCode}`);
        if (!res.ok) throw new Error('Failed to fetch game status');
        return res.json();
    },

    /**
     * Validate player identity with server
     */
    validatePlayer: async (gameCode: string, playerId: string): Promise<PlayerValidationResult> => {
        const res = await fetch(`/api/game/${gameCode}/validate-player?playerId=${playerId}`);
        if (!res.ok) return { valid: false };
        return res.json();
    },

    /**
     * Check if player has already responded to a card
     */
    checkResponse: async (gameCode: string, playerId: string, cardId: number) => {
        const res = await fetch(`/api/game/${gameCode}/check-response?playerId=${playerId}&cardId=${cardId}`);
        if (!res.ok) throw new Error('Failed to check response');
        return res.json();
    },

    /**
     * Submit a card response
     */
    submitResponse: async (gameCode: string, playerId: string, cardId: number, responseId: number) => {
        const res = await fetch(`/api/game/${gameCode}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, cardId, responseId })
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to submit response');
        }
        return res.json();
    },

    /**
     * Vote for a team leader
     */
    voteForLeader: async (gameCode: string, playerId: number, candidateId: number) => {
        const res = await fetch(`/api/game/${gameCode}/vote-leader`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, candidateId })
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to vote for leader');
        }
        return res.json();
    },

    /**
     * Leave the game
     */
    leaveGame: async (gameCode: string, playerId: string) => {
        // Use beacon if possible for reliability during unload, otherwise fetch
        const data = JSON.stringify({ playerId });
        const blob = new Blob([data], { type: 'application/json' });

        if (navigator.sendBeacon) {
            navigator.sendBeacon(`/api/game/${gameCode}/leave`, blob);
        } else {
            await fetch(`/api/game/${gameCode}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: data
            });
        }
    },

    /**
     * Check phase transition (are all leaders done?)
     */
    checkPhaseTransition: async (gameCode: string, cardId: number) => {
        await fetch(`/api/game/${gameCode}/check-leaders-responded?cardId=${cardId}`);
    },

    /**
     * Fetch current votes (for leader view)
     */
    fetchVotes: async (gameCode: string, playerId: string, cardId: number) => {
        const res = await fetch(`/api/game/${gameCode}/votes?playerId=${playerId}&cardId=${cardId}`);
        if (!res.ok) return {};
        return res.json();
    },

    /**
     * Force advance game (timer expiry or all votes in)
     */
    advanceGame: async (gameCode: string, currentCardIndex?: number) => {
        await fetch(`/api/game/${gameCode}/next`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentCardIndex })
        });
    },

    /**
     * Fetch final game results
     */
    fetchResults: async (gameCode: string) => {
        const res = await fetch(`/api/game/${gameCode}/results`);
        if (!res.ok) throw new Error('Failed to fetch results');
        return res.json();
    }
};
