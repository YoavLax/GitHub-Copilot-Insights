import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AverageChatRequestsChart = ({ dailyData }) => {
  if (!dailyData || dailyData.length === 0) {
    return null;
  }

  const data = {
    labels: dailyData.map(item => item.date),
    datasets: [
      {
        label: 'Avg Requests',
        data: dailyData.map(item => item.avgRequests),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 1)',
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Avg Requests: ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toFixed(0);
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        }
      }
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-blue transition-all duration-300">
      <h3 className="text-lg font-semibold text-gradient mb-1">Average chat requests per active user</h3>
      <p className="text-sm text-slate-400 mb-4">
        User-initiated requests across all chat modes, excluding code completions
      </p>
      <div style={{ height: '250px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default AverageChatRequestsChart;
