import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import WorkerList from '../components/Admin/WorkerList';
import WorkerDetail from '../components/Admin/WorkerDetail';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getAllWorkers, getWorkerById } from '../services/api';
import { formatDateTime } from '../utils/formatters';
import { useDemo } from '../context/DemoContext';

const REFRESH_INTERVAL = 30000;

const AdminDashboard = () => {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workerDetail, setWorkerDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const { isDemoMode } = useDemo();

    const fetchWorkers = useCallback(async () => {
        try {
            const res = await getAllWorkers();
            setWorkers(res.data.workers || []);
            setLastUpdated(new Date());
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load workers.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Re-fetch when demo mode is toggled; reset selected worker
    useEffect(() => {
        setLoading(true);
        setSelectedWorker(null);
        setWorkerDetail(null);
        fetchWorkers();
    }, [isDemoMode, fetchWorkers]);

    useEffect(() => {
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

    const activeCount = workers.filter((w) => w.isActive).length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                    {/* Page header */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Monitor all workers and sensor data in real time
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {lastUpdated && (
                                <span className="text-xs text-gray-400">
                                    Updated {formatDateTime(lastUpdated)}
                                </span>
                            )}
                            <button
                                onClick={fetchWorkers}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition"
                            >
                                <span>🔄</span> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Demo mode banner */}
                    {isDemoMode && (
                        <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-5 py-3 mb-5 text-sm">
                            <span className="text-xl">🎭</span>
                            <div>
                                <p className="font-semibold">Demo Mode Active</p>
                                <p className="text-xs mt-0.5 opacity-80">
                                    Showing simulated workers and sensor data. Toggle Live Mode in the navbar to use real data.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stats row */}
                    {!loading && workers.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Workers</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{workers.length}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Active</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{activeCount}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-400">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Offline</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {workers.length - activeCount}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-400">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Selected</p>
                                <p className="text-sm font-semibold text-gray-700 mt-1 truncate">
                                    {selectedWorker ? selectedWorker.name : '—'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-5 text-sm">
                            <span className="text-xl">❌</span>
                            <div>
                                <p className="font-semibold">Error</p>
                                <p className="text-xs mt-0.5 opacity-80">{error}</p>
                            </div>
                        </div>
                    )}

                    {loading && <LoadingSpinner message="Loading workers…" />}

                    {/* Main admin layout */}
                    {!loading && (
                        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-5 items-start">
                            <WorkerList
                                workers={workers}
                                selectedId={selectedWorker?._id}
                                onSelect={handleSelectWorker}
                                loading={false}
                            />
                            <WorkerDetail
                                worker={selectedWorker}
                                detail={workerDetail}
                                loading={detailLoading}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
