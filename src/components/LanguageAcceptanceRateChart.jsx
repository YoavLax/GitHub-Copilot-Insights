import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LanguageAcceptanceRateChart = ({ languageBreakdown }) => {
  if (!languageBreakdown || Object.keys(languageBreakdown).length === 0) {
    return null;
  }

  // Calculate acceptance rates and sort by acceptance rate ASC
  const languagesWithRates = Object.entries(languageBreakdown)
    .filter(([language]) => language !== 'unknown')
    .map(([language, stats]) => ({
      language: language.charAt(0).toUpperCase() + language.slice(1), // Capitalize first letter
      rate: stats.codeGeneration > 0 
        ? ((stats.codeAcceptance / stats.codeGeneration) * 100) 
        : 0,
      generations: stats.codeGeneration,
      acceptances: stats.codeAcceptance
    }))
    .sort((a, b) => b.rate - a.rate); // Sort by acceptance rate DESC (for horizontal chart, highest at top)

  const data = {
    labels: languagesWithRates.map(item => item.language),
    datasets: [
      {
        label: 'Acceptance Rate (%)',
        data: languagesWithRates.map(item => item.rate),
        backgroundColor: languagesWithRates.map(item => {
          // Color based on acceptance rate
          if (item.rate >= 80) return 'rgba(34, 197, 94, 0.8)'; // Green for high
          if (item.rate >= 60) return 'rgba(59, 130, 246, 0.8)'; // Blue for medium
          if (item.rate >= 40) return 'rgba(251, 146, 60, 0.8)'; // Orange for low
          return 'rgba(239, 68, 68, 0.8)'; // Red for very low
        }),
        borderColor: languagesWithRates.map(item => {
          if (item.rate >= 80) return 'rgba(34, 197, 94, 1)';
          if (item.rate >= 60) return 'rgba(59, 130, 246, 1)';
          if (item.rate >= 40) return 'rgba(251, 146, 60, 1)';
          return 'rgba(239, 68, 68, 1)';
        }),
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
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = languagesWithRates[context.dataIndex];
            return [
              `Acceptance Rate: ${item.rate.toFixed(1)}%`,
              `Acceptances: ${item.acceptances.toLocaleString()}`,
              `Generations: ${item.generations.toLocaleString()}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Acceptance Rate (%)',
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
      <h3 className="text-lg font-semibold text-gradient mb-2">Acceptance Rate by Programming Language</h3>
      <p className="text-sm text-slate-400 mb-4">
        Percentage of AI suggestions accepted per language (sorted by acceptance rate, highest first)
      </p>
      <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
        <div style={{ height: `${Math.max(languagesWithRates.length * 35, 400)}px` }}>
          <Bar data={data} options={options} />
        </div>
      </div>
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-slate-400">Excellent (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-slate-400">Good (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-slate-400">Fair (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-slate-400">Needs Attention (&lt;40%)</span>
        </div>
      </div>
    </div>
  );
};

export default LanguageAcceptanceRateChart;
