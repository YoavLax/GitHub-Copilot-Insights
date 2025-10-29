import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IdeBarChart = ({ ideBreakdown }) => {
  if (!ideBreakdown || Object.keys(ideBreakdown).length === 0) {
    return null;
  }

  // Sort IDEs by total users
  const sortedIdes = Object.entries(ideBreakdown)
    .sort((a, b) => b[1].users - a[1].users);

  const data = {
    labels: sortedIdes.map(([ide]) => ide),
    datasets: [
      {
        label: 'Users',
        data: sortedIdes.map(([, stats]) => stats.users),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Interactions',
        data: sortedIdes.map(([, stats]) => stats.interactions),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
      {
        label: 'Code Acceptances',
        data: sortedIdes.map(([, stats]) => stats.codeAcceptance),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toLocaleString();
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Users',
          color: 'rgba(59, 130, 246, 1)',
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Interactions / Acceptances',
          color: 'rgba(139, 92, 246, 1)',
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-blue transition-all duration-300">
      <h3 className="text-lg font-semibold text-gradient mb-4">IDE Distribution</h3>
      <div style={{ height: '300px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default IdeBarChart;
