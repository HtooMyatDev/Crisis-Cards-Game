import React, { Suspense } from 'react'
import JoinGamePage from '@/components/auth/JoinGamePage'
import { Loader2 } from 'lucide-react'

const joinGame = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        }>
            <JoinGamePage />
        </Suspense>
    )
}

export default joinGame
