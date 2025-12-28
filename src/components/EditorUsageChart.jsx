import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EditorUsageChart = ({ ideBreakdown }) => {
  if (!ideBreakdown || Object.keys(ideBreakdown).length === 0) {
    return null;
  }

  // Sort IDEs by user count (descending)
  const sortedIdes = Object.entries(ideBreakdown)
    .sort((a, b) => b[1].users - a[1].users)
    .map(([ide, stats]) => ({
      ide: ide.charAt(0).toUpperCase() + ide.slice(1),
      users: stats.users
    }));

  const data = {
    labels: sortedIdes.map(item => item.ide),
    datasets: [
      {
        label: 'Users',
        data: sortedIdes.map(item => item.users),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Users: ${context.parsed.x.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Number of Users',
          color: 'rgba(148, 163, 184, 1)',
        }
      },
      y: {
        ticks: {
          autoSkip: false,
        }
      }
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-blue transition-all duration-300">
      <h3 className="text-lg font-semibold text-gradient mb-2">
        <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
        Editor Usage
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        Count of unique users per IDE/editor
      </p>
      <div style={{ height: `${Math.max(sortedIdes.length * 50, 200)}px` }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default EditorUsageChart;
