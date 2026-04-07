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
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatTime } from '../../utils/formatters';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SensorChart = ({ data, title }) => {
    if (!data || data.length === 0) {
        return (
            <p className="text-center text-gray-400 italic py-8">
                No data available for chart.
            </p>
        );
    }

    const sorted = [...data].reverse().slice(-20);
    const labels = sorted.map((d) => formatTime(d.createdAt || d.timestamp));

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Temperature (°C)',
                data: sorted.map((d) => d.temperature),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y',
                pointRadius: 3,
                pointHoverRadius: 5,
            },
            {
                label: 'UV Index',
                data: sorted.map((d) => d.uvIndex),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245,158,11,0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y1',
                pointRadius: 3,
                pointHoverRadius: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { position: 'top', labels: { font: { size: 12 } } },
            title: {
                display: !!title,
                text: title,
                font: { size: 14, weight: 'bold' },
                color: '#374151',
            },
            tooltip: {
                backgroundColor: 'rgba(17,24,39,0.9)',
                titleFont: { size: 12 },
                bodyFont: { size: 11 },
                padding: 10,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: { font: { size: 10 }, maxRotation: 45 },
            },
            y: {
                type: 'linear',
                position: 'left',
                grid: { color: 'rgba(0,0,0,0.04)' },
                title: { display: true, text: 'Temp (°C)', font: { size: 11 } },
                ticks: { font: { size: 11 } },
            },
            y1: {
                type: 'linear',
                position: 'right',
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'UV Index', font: { size: 11 } },
                ticks: { font: { size: 11 } },
            },
        },
    };

    return (
        <div className="graph-container">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default SensorChart;
