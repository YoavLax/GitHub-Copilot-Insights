import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const LanguagePieChart = ({ languageBreakdown }) => {
  if (!languageBreakdown || Object.keys(languageBreakdown).length === 0) {
    return null;
  }

  // Sort and take top 10 languages
  const sortedLanguages = Object.entries(languageBreakdown)
    .sort((a, b) => b[1].codeGeneration - a[1].codeGeneration)
    .slice(0, 10);

  const data = {
    labels: sortedLanguages.map(([lang]) => lang.charAt(0).toUpperCase() + lang.slice(1)),
    datasets: [
      {
        label: 'Code Generations',
        data: sortedLanguages.map(([, stats]) => stats.codeGeneration),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // blue
          'rgba(139, 92, 246, 0.8)',   // purple
          'rgba(236, 72, 153, 0.8)',   // pink
          'rgba(251, 146, 60, 0.8)',   // orange
          'rgba(34, 197, 94, 0.8)',    // green
          'rgba(234, 179, 8, 0.8)',    // yellow
          'rgba(239, 68, 68, 0.8)',    // red
          'rgba(14, 165, 233, 0.8)',   // sky
          'rgba(168, 85, 247, 0.8)',   // violet
          'rgba(252, 211, 77, 0.8)',   // amber
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(252, 211, 77, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-purple transition-all duration-300">
      <h3 className="text-lg font-semibold text-gradient mb-4">Programming Languages</h3>
      <div style={{ height: '400px' }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default LanguagePieChart;
