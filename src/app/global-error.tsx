'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
        <html>
            <body className="bg-gray-900 text-white flex items-center justify-center min-h-screen p-4">
                <div className="max-w-md text-center">
                    <h1 className="text-4xl font-black mb-4 text-red-500">SYSTEM FAILURE</h1>
                    <h2 className="text-xl mb-6">Critical Error Detected</h2>
                    <p className="text-gray-400 mb-8 font-mono text-sm bg-gray-800 p-4 rounded border border-gray-700 overflow-auto">
                        {error.message || "Unknown Error"}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors"
                    >
                        Attempt Recovery
                    </button>
                </div>
            </body>
        </html>
    )
}
