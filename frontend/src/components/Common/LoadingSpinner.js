import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullscreen = false }) => {
    const wrapper = fullscreen
        ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
        : 'flex flex-col items-center justify-center py-12';

    return (
        <div className={wrapper} role="status" aria-live="polite">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
