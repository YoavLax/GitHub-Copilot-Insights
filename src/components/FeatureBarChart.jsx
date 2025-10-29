import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const FeatureBarChart = ({ featureBreakdown }) => {
  if (!featureBreakdown || Object.keys(featureBreakdown).length === 0) {
    return null;
  }

  // Filter and sort features
  const sortedFeatures = Object.entries(featureBreakdown)
    .filter(([feature]) => feature !== 'chat_panel_unknown_mode')
    .sort((a, b) => b[1].interactions - a[1].interactions);

  // Format feature names for display
  const formatFeatureName = (feature) => {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Color palette for features
  const colors = [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(249, 115, 22, 0.8)',   // Orange
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(14, 165, 233, 0.8)',   // Cyan
    'rgba(168, 85, 247, 0.8)',   // Violet
    'rgba(234, 179, 8, 0.8)',    // Yellow
    'rgba(239, 68, 68, 0.8)',    // Red
    'rgba(16, 185, 129, 0.8)',   // Emerald
  ];

  const data = {
    labels: sortedFeatures.map(([feature]) => formatFeatureName(feature)),
    datasets: [
      {
        label: 'Interactions',
        data: sortedFeatures.map(([, stats]) => stats.interactions),
        backgroundColor: sortedFeatures.map((_, index) => colors[index % colors.length]),
        borderColor: sortedFeatures.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
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
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed.toLocaleString();
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-blue transition-all duration-300">
      <h3 className="text-lg font-semibold text-gradient mb-2">Feature Usage</h3>
      <p className="text-sm text-slate-400 mb-4">
        Distribution of user interactions across different Copilot features
      </p>
      <div style={{ height: '400px' }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default FeatureBarChart;
