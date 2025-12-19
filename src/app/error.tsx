'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-8 max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center border-4 border-red-500 dark:border-red-400">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                    Something went wrong!
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">
                    We encountered an unexpected error.
                </p>

                {/* Developer details in development only usually, but good for now */}
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-left overflow-auto max-h-32">
                    <p className="font-mono text-xs text-red-600 dark:text-red-400 break-all">
                        {error.message || "Unknown error occurred"}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:translate-y-[-2px] hover:shadow-lg transition-all"
                    >
                        <RotateCcw size={18} />
                        Try again
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full px-6 py-3 bg-transparent text-gray-600 dark:text-gray-400 font-bold hover:text-black dark:hover:text-white transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    )
}
