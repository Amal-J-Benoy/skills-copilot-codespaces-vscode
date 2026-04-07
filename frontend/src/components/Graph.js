import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Graph = ({ data, title }) => {
    if (!data || data.length === 0) {
        return <div className="graph-empty">No data available for chart.</div>;
    }

    // Show latest 20 entries in chronological order
    const sorted = [...data].reverse().slice(-20);

    const labels = sorted.map((d) =>
        new Date(d.createdAt || d.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    );

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Temperature (°C)',
                data: sorted.map((d) => d.temperature),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231,76,60,0.15)',
                tension: 0.3,
                yAxisID: 'y',
            },
            {
                label: 'UV Index',
                data: sorted.map((d) => d.uvIndex),
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243,156,18,0.15)',
                tension: 0.3,
                yAxisID: 'y1',
            },
        ],
    };

    const options = {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { position: 'top' },
            title: { display: !!title, text: title },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Temperature (°C)' },
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'UV Index' },
            },
        },
    };

    return (
        <div className="graph-container">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default Graph;
