import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import Graph from '../components/Graph';
import { getAllWorkers, getWorkerById } from '../services/api';

const REFRESH_INTERVAL = 30000;

const statusIcon = (severity) => {
    if (severity === 'CRITICAL') return '🚨';
    if (severity === 'HIGH') return '⚠️';
    return '✅';
};

const AdminDashboard = () => {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workerDetail, setWorkerDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchWorkers = useCallback(async () => {
        try {
            const res = await getAllWorkers();
            setWorkers(res.data.workers || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load workers.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkers();
        const interval = setInterval(fetchWorkers, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchWorkers]);

    const handleSelectWorker = async (worker) => {
        setSelectedWorker(worker);
        setWorkerDetail(null);
        setDetailLoading(true);
        try {
            const res = await getWorkerById(worker._id);
            setWorkerDetail(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load worker details.');
        } finally {
            setDetailLoading(false);
        }
    };

    const latestReading = workerDetail?.recentData?.[0];

    return (
        <div className="page">
            <Navbar />
            <div className="page-content">
                <div className="page-header">
                    <h2>Admin Dashboard</h2>
                    <span className="refresh-hint">Auto-refreshes every 30s</span>
                </div>

                {loading && <div className="loading">Loading workers...</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <div className="admin-layout">
                    {/* Workers list */}
                    <div className="workers-panel">
                        <h3>Workers ({workers.length})</h3>
                        {workers.length === 0 && !loading && (
                            <div className="empty-state">No workers found.</div>
                        )}
                        <ul className="workers-list">
                            {workers.map((w) => (
                                <li
                                    key={w._id}
                                    className={`worker-item ${selectedWorker?._id === w._id ? 'selected' : ''}`}
                                    onClick={() => handleSelectWorker(w)}
                                >
                                    <span className="worker-name">{w.name}</span>
                                    <span className="worker-email">{w.email}</span>
                                    <span className="worker-device">📟 {w.deviceId}</span>
                                    <span className={`worker-status ${w.isActive ? 'active' : 'inactive'}`}>
                                        {w.isActive ? '🟢 Active' : '🔴 Inactive'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Worker detail */}
                    <div className="detail-panel">
                        {!selectedWorker && (
                            <div className="empty-state">Select a worker to view details.</div>
                        )}

                        {selectedWorker && (
                            <>
                                <h3>
                                    {selectedWorker.name}
                                    {latestReading && (
                                        <span className={`severity-badge severity-${latestReading.severity?.toLowerCase()}`}>
                                            {statusIcon(latestReading.severity)} {latestReading.severity}
                                        </span>
                                    )}
                                </h3>

                                {detailLoading && <div className="loading">Loading details...</div>}

                                {latestReading && (
                                    <div className="cards-grid">
                                        <DashboardCard
                                            title="Temperature"
                                            value={latestReading.temperature}
                                            unit="°C"
                                            icon="🌡️"
                                            severity={latestReading.severity}
                                            label={latestReading.severity}
                                        />
                                        <DashboardCard
                                            title="UV Index"
                                            value={latestReading.uvIndex}
                                            icon="☀️"
                                            severity={latestReading.severity}
                                            label={latestReading.severity}
                                        />
                                    </div>
                                )}

                                {latestReading?.alerts?.length > 0 && (
                                    <div className={`alert-banner alert-${latestReading.severity?.toLowerCase()}`}>
                                        <strong>⚠️ Alerts:</strong> {latestReading.alerts.join(', ')}
                                    </div>
                                )}

                                {workerDetail?.recentData?.length > 0 && (
                                    <div className="chart-section">
                                        <h4>Historical Trends</h4>
                                        <Graph
                                            data={workerDetail.recentData}
                                            title={`${selectedWorker.name} - Sensor Trends`}
                                        />
                                    </div>
                                )}

                                {!detailLoading && workerDetail?.recentData?.length === 0 && (
                                    <div className="empty-state">No sensor data for this worker yet.</div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
