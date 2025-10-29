import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ModelBarChart = ({ modelBreakdown }) => {
  if (!modelBreakdown || Object.keys(modelBreakdown).length === 0) {
    return null;
  }

  // Filter and sort models
  const sortedModels = Object.entries(modelBreakdown)
    .filter(([model]) => model !== 'unknown')
    .sort((a, b) => b[1].interactions - a[1].interactions);

  const data = {
    labels: sortedModels.map(([model]) => model),
    datasets: [
      {
        label: 'Interactions',
        data: sortedModels.map(([, stats]) => stats.interactions),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Code Generations',
        data: sortedModels.map(([, stats]) => stats.codeGeneration),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Code Acceptances',
        data: sortedModels.map(([, stats]) => stats.codeAcceptance),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-purple transition-all duration-300">
      <h3 className="text-lg font-semibold text-gradient mb-4">AI Model Usage</h3>
      <div style={{ height: '350px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ModelBarChart;
