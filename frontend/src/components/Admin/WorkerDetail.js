import React from 'react';
import SensorCard from '../Dashboard/SensorCard';
import SensorChart from '../Dashboard/SensorChart';
import LoadingSpinner from '../Common/LoadingSpinner';
import { severityColors, formatDateTime } from '../../utils/formatters';

const WorkerDetail = ({ worker, detail, loading }) => {
    if (!worker) {
        return (
            <div className="bg-white rounded-xl shadow-sm flex items-center justify-center h-64">
                <p className="text-gray-400 italic text-sm">
                    Select a worker to view their details.
                </p>
            </div>
        );
    }

    const latest = detail?.recentData?.[0];
    const colors = severityColors(latest?.severity);

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">{worker.name}</h3>
                    <p className="text-xs text-gray-400">{worker.email} · 📟 {worker.deviceId}</p>
                </div>
                {latest && (
                    <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`}
                    >
                        {colors.icon} {latest.severity}
                    </span>
                )}
            </div>

            <div className="p-6 space-y-5">
                {loading && <LoadingSpinner message="Loading sensor data…" />}

                {/* Sensor cards */}
                {latest && !loading && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <SensorCard
                                title="Temperature"
                                value={latest.temperature}
                                unit="°C"
                                icon="🌡️"
                                severity={latest.severity}
                                label={latest.severity}
                            />
                            <SensorCard
                                title="UV Index"
                                value={latest.uvIndex}
                                icon="☀️"
                                severity={latest.severity}
                                label={latest.severity}
                            />
                            {latest.humidity !== undefined && latest.humidity !== null && (
                                <SensorCard
                                    title="Humidity"
                                    value={latest.humidity}
                                    unit="%"
                                    icon="💧"
                                    severity={latest.severity}
                                    label={latest.severity}
                                />
                            )}
                            {latest.batteryLevel !== undefined && latest.batteryLevel !== null && (
                                <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-gray-300">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                        🔋 Battery
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {latest.batteryLevel}
                                        <span className="text-sm font-normal text-gray-500 ml-1">%</span>
                                    </p>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                latest.batteryLevel > 50
                                                    ? 'bg-green-500'
                                                    : latest.batteryLevel > 20
                                                    ? 'bg-amber-500'
                                                    : 'bg-red-500'
                                            }`}
                                            style={{ width: `${latest.batteryLevel}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-gray-300">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                    Last Reading
                                </p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {formatDateTime(latest.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Active alerts */}
                        {latest.alerts?.length > 0 && (
                            <div
                                className={`flex items-start gap-2 px-4 py-3 rounded-lg border ${
                                    latest.severity === 'CRITICAL'
                                        ? 'bg-red-50 border-red-300 text-red-700 animate-pulse-alert'
                                        : 'bg-amber-50 border-amber-300 text-amber-700'
                                }`}
                            >
                                <span className="text-base mt-0.5">⚠️</span>
                                <div>
                                    <p className="font-semibold text-sm">Active Alerts</p>
                                    <ul className="text-sm mt-1 space-y-0.5">
                                        {latest.alerts.map((a, i) => (
                                            <li key={i}>• {a}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Chart */}
                {detail?.recentData?.length > 0 && !loading && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-600 mb-3">
                            Historical Trends (last 20 readings)
                        </h4>
                        <SensorChart
                            data={detail.recentData}
                            title={`${worker.name} – Sensor Trends`}
                        />
                    </div>
                )}

                {!loading && detail && detail.recentData?.length === 0 && (
                    <p className="text-center text-gray-400 italic py-8 text-sm">
                        No sensor data recorded for this worker yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default WorkerDetail;
