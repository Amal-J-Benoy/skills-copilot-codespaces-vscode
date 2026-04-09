import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import SensorCard from '../components/Dashboard/SensorCard';
import SensorChart from '../components/Dashboard/SensorChart';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getSensorData } from '../services/api';
import { formatDateTime, severityColors } from '../utils/formatters';

const REFRESH_INTERVAL = 30000; // 30 seconds

const WorkerDashboard = () => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await getSensorData();
            setSensorData(res.data.data || []);
            setLastUpdated(new Date());
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch sensor data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchData]);

    const latest = sensorData.length > 0 ? sensorData[0] : null;
    const colors = severityColors(latest?.severity);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
                    {/* Page header */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Real-time sensor monitoring for your wearable device
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {lastUpdated && (
                                <span className="text-xs text-gray-400">
                                    Updated {formatDateTime(lastUpdated)}
                                </span>
                            )}
                            <button
                                onClick={fetchData}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition"
                            >
                                <span>🔄</span> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Loading state */}
                    {loading && <LoadingSpinner message="Loading sensor data…" />}

                    {/* Error state */}
                    {error && !loading && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-5 text-sm">
                            <span className="text-xl">❌</span>
                            <div>
                                <p className="font-semibold">Could not load sensor data</p>
                                <p className="text-xs mt-0.5 opacity-80">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Active alert banner */}
                    {latest?.alerts?.length > 0 && (
                        <div
                            className={`flex items-start gap-3 px-5 py-4 rounded-xl border mb-5 ${
                                latest.severity === 'CRITICAL'
                                    ? 'bg-red-50 border-red-300 text-red-700 animate-pulse-alert'
                                    : 'bg-amber-50 border-amber-300 text-amber-700'
                            }`}
                        >
                            <span className="text-xl flex-shrink-0">⚠️</span>
                            <div>
                                <p className="font-bold text-sm">Active Safety Alerts</p>
                                <ul className="mt-1 space-y-0.5 text-sm">
                                    {latest.alerts.map((alert, i) => (
                                        <li key={i}>• {alert}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Sensor cards */}
                    {latest && !loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                            <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-gray-300 flex flex-col justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                    🔋 Battery
                                </p>
                                {latest.batteryLevel !== undefined && latest.batteryLevel !== null ? (
                                    <>
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
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">N/A</p>
                                )}
                                <p className="mt-2 text-xs text-gray-400">Device: {latest.deviceId}</p>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !latest && !error && (
                        <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 text-center">
                            <span className="text-5xl mb-3">📡</span>
                            <p className="font-semibold text-gray-600">No sensor data recorded yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Your device will appear here once it starts transmitting.
                            </p>
                        </div>
                    )}

                    {/* Historical chart */}
                    {sensorData.length > 0 && !loading && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-base font-semibold text-gray-700 mb-4">
                                Historical Trends
                                <span className="ml-2 text-xs text-gray-400 font-normal">
                                    (last 20 readings)
                                </span>
                            </h2>
                            <SensorChart
                                data={sensorData}
                                title={
                                    sensorData.some((d) => d.humidity !== undefined && d.humidity !== null)
                                        ? 'Temperature, UV Index & Humidity Over Time'
                                        : 'Temperature & UV Index Over Time'
                                }
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default WorkerDashboard;
