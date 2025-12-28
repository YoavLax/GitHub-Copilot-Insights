import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopLanguagesByAcceptancesChart = ({ languageBreakdown }) => {
  if (!languageBreakdown || Object.keys(languageBreakdown).length === 0) {
    return null;
  }

  // Sort languages by total acceptances (descending) and take top 10
  const topLanguages = Object.entries(languageBreakdown)
    .filter(([language]) => language !== 'unknown')
    .sort((a, b) => b[1].codeAcceptance - a[1].codeAcceptance)
    .slice(0, 10)
    .map(([language, stats]) => ({
      language: language.charAt(0).toUpperCase() + language.slice(1),
      acceptances: stats.codeAcceptance
    }));

  const data = {
    labels: topLanguages.map(item => item.language),
    datasets: [
      {
        label: 'Acceptances',
        data: topLanguages.map(item => item.acceptances),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
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
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Acceptances: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        },
        title: {
          display: true,
          text: 'Number of Acceptances',
          color: 'rgba(148, 163, 184, 1)',
        }
      },
      x: {
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
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Top Languages by Acceptances
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        Count of code acceptances per programming language (top 10)
      </p>
      <div style={{ height: '300px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TopLanguagesByAcceptancesChart;
