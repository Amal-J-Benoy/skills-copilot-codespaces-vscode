/**
 * Format a numeric value to a fixed number of decimal places.
 * Returns '—' if value is null or undefined.
 */
export const formatNumber = (value, decimals = 1) => {
    if (value === null || value === undefined) return '—';
    return Number(value).toFixed(decimals);
};

/**
 * Format a date string or Date object into a human-readable time string.
 */
export const formatTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format a date string or Date object into a full date-time string.
 */
export const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Return Tailwind colour classes for a given severity level.
 */
export const severityColors = (severity) => {
    switch (severity) {
        case 'CRITICAL':
            return {
                border: 'border-red-500',
                bg: 'bg-red-50',
                text: 'text-red-700',
                badge: 'bg-red-100 text-red-700',
                icon: '🚨',
            };
        case 'HIGH':
            return {
                border: 'border-amber-500',
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                badge: 'bg-amber-100 text-amber-700',
                icon: '⚠️',
            };
        default:
            return {
                border: 'border-green-500',
                bg: 'bg-green-50',
                text: 'text-green-700',
                badge: 'bg-green-100 text-green-700',
                icon: '✅',
            };
    }
};
