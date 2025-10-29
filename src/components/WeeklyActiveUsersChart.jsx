import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const WeeklyActiveUsersChart = ({ weeklyData }) => {
  if (!weeklyData || weeklyData.length === 0) {
    return null;
  }

  const data = {
    labels: weeklyData.map(item => item.week),
    datasets: [
      {
        label: 'Active Users',
        data: weeklyData.map(item => item.users),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
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
            return `Users: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        }
      }
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-blue transition-all duration-300">
      <h3 className="text-lg font-semibold text-gradient mb-1">IDE weekly active users</h3>
      <p className="text-sm text-slate-400 mb-4">
        Unique users who used Copilot on a given week, either via chat or code completions
      </p>
      <div style={{ height: '250px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default WeeklyActiveUsersChart;
