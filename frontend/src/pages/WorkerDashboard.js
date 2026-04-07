import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import Graph from '../components/Graph';
import { getSensorData } from '../services/api';

const REFRESH_INTERVAL = 30000; // 30 seconds

const WorkerDashboard = () => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const res = await getSensorData();
            setSensorData(res.data.data || []);
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

    return (
        <div className="page">
            <Navbar />
            <div className="page-content">
                <div className="page-header">
                    <h2>My Dashboard</h2>
                    <span className="refresh-hint">Auto-refreshes every 30s</span>
                </div>

                {loading && <div className="loading">Loading sensor data...</div>}
                {error && <div className="alert alert-error">{error}</div>}

                {latest && (
                    <>
                        <div className="cards-grid">
                            <DashboardCard
                                title="Temperature"
                                value={latest.temperature}
                                unit="°C"
                                icon="🌡️"
                                severity={latest.severity}
                                label={latest.severity}
                            />
                            <DashboardCard
                                title="UV Index"
                                value={latest.uvIndex}
                                unit=""
                                icon="☀️"
                                severity={latest.severity}
                                label={latest.severity}
                            />
                            <DashboardCard
                                title="Status"
                                value={latest.severity}
                                icon={latest.severity === 'SAFE' ? '✅' : latest.severity === 'HIGH' ? '⚠️' : '🚨'}
                                severity={latest.severity}
                                label={`Device: ${latest.deviceId}`}
                            />
                        </div>

                        {latest.alerts && latest.alerts.length > 0 && (
                            <div className={`alert-banner alert-${latest.severity.toLowerCase()}`}>
                                <strong>⚠️ Active Alerts:</strong> {latest.alerts.join(', ')}
                            </div>
                        )}
                    </>
                )}

                {!loading && !latest && !error && (
                    <div className="empty-state">No sensor data recorded yet.</div>
                )}

                {sensorData.length > 0 && (
                    <div className="chart-section">
                        <h3>Historical Trends (last 20 readings)</h3>
                        <Graph data={sensorData} title="Temperature & UV Index Over Time" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkerDashboard;
