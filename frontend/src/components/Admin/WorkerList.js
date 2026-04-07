import React from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';

const WorkerList = ({ workers, selectedId, onSelect, loading }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                    Workers
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        {workers.length}
                    </span>
                </h3>
            </div>

            {loading && <LoadingSpinner message="Loading workers…" />}

            {!loading && workers.length === 0 && (
                <p className="text-center text-gray-400 italic py-8 text-sm">
                    No workers found.
                </p>
            )}

            <ul className="divide-y divide-gray-50 max-h-[68vh] overflow-y-auto">
                {workers.map((w) => (
                    <li key={w._id}>
                        <button
                            onClick={() => onSelect(w)}
                            className={`w-full text-left px-5 py-3.5 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                selectedId === w._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800 text-sm truncate max-w-[120px]">
                                    {w.name}
                                </span>
                                <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        w.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {w.isActive ? '● Active' : '● Offline'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{w.email}</p>
                            <p className="text-xs text-gray-400 mt-0.5">📟 {w.deviceId}</p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WorkerList;
