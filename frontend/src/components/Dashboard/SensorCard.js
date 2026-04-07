import React from 'react';
import { severityColors } from '../../utils/formatters';

const SensorCard = ({ title, value, unit, icon, severity, label }) => {
    const colors = severityColors(severity);

    return (
        <div
            className={`bg-white rounded-xl p-5 shadow-sm border-l-4 transition-transform hover:-translate-y-0.5 ${colors.border}`}
        >
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {title}
                </span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-800">
                    {value !== undefined && value !== null ? value : '—'}
                </span>
                {unit && <span className="text-base text-gray-400">{unit}</span>}
            </div>
            {label && (
                <span
                    className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}
                >
                    {colors.icon} {label}
                </span>
            )}
        </div>
    );
};

export default SensorCard;
