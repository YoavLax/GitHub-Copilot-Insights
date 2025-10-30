import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ModelAcceptanceRateChart = ({ modelBreakdown }) => {
  if (!modelBreakdown || Object.keys(modelBreakdown).length === 0) {
    return null;
  }

  // Aggregate data by model (handle "model|feature" format)
  const modelStats = {};
  
  Object.entries(modelBreakdown).forEach(([key, stats]) => {
    // Extract model name (handle both "model|feature" and "model" formats)
    const model = key.includes('|') ? key.split('|')[0] : key;
    
    if (model === 'unknown') return;
    
    if (!modelStats[model]) {
      modelStats[model] = {
        codeGeneration: 0,
        codeAcceptance: 0
      };
    }
    
    modelStats[model].codeGeneration += stats.codeGeneration || 0;
    modelStats[model].codeAcceptance += stats.codeAcceptance || 0;
  });

  // Calculate acceptance rates and sort
  const modelsWithRates = Object.entries(modelStats)
    .map(([model, stats]) => ({
      model,
      rate: stats.codeGeneration > 0 
        ? ((stats.codeAcceptance / stats.codeGeneration) * 100) 
        : 0,
      generations: stats.codeGeneration,
      acceptances: stats.codeAcceptance
    }))
    .filter(item => item.generations > 0) // Only show models with actual data
    .sort((a, b) => b.rate - a.rate);

  const data = {
    labels: modelsWithRates.map(item => item.model),
    datasets: [
      {
        label: 'Acceptance Rate (%)',
        data: modelsWithRates.map(item => item.rate),
        backgroundColor: modelsWithRates.map(item => {
          // Color based on acceptance rate
          if (item.rate >= 80) return 'rgba(34, 197, 94, 0.8)'; // Green for high
          if (item.rate >= 60) return 'rgba(59, 130, 246, 0.8)'; // Blue for medium
          if (item.rate >= 40) return 'rgba(251, 146, 60, 0.8)'; // Orange for low
          return 'rgba(239, 68, 68, 0.8)'; // Red for very low
        }),
        borderColor: modelsWithRates.map(item => {
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
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = modelsWithRates[context.dataIndex];
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
      y: {
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
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        }
      }
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-purple transition-all duration-300">
      <h3 className="text-lg font-semibold text-gradient mb-2">Acceptance Rate by Model</h3>
      <p className="text-sm text-slate-400 mb-4">
        Percentage of AI suggestions accepted per model (higher is better)
      </p>
      <div style={{ height: '350px' }}>
        <Bar data={data} options={options} />
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

export default ModelAcceptanceRateChart;
