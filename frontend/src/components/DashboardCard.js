import React from 'react';

const severityClass = {
    SAFE: 'status-safe',
    HIGH: 'status-high',
    CRITICAL: 'status-critical',
};

const DashboardCard = ({ title, value, unit, icon, severity, label }) => {
    const statusClass = severityClass[severity] || 'status-safe';

    return (
        <div className={`dashboard-card ${statusClass}`}>
            <div className="card-header">
                <span className="card-icon">{icon}</span>
                <span className="card-title">{title}</span>
            </div>
            <div className="card-body">
                <span className="card-value">
                    {value !== undefined && value !== null ? value : '—'}
                </span>
                {unit && <span className="card-unit">{unit}</span>}
            </div>
            {label && (
                <div className={`card-status ${statusClass}`}>{label}</div>
            )}
        </div>
    );
};

export default DashboardCard;
