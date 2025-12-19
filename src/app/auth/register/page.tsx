import React from 'react';
import Link from 'next/link';

export default function RegisterDisabled() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Registration Disabled
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    New account registration is currently turned off. Please contact the administrator if you believe this is an error.
                </p>
                <div className="mt-6">
                    <Link
                        href="/auth/login"
                        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
