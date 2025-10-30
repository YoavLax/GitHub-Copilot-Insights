import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  'gpt-4o': '#60a5fa',
  'claude-sonnet-4': '#93c5fd',
  'gpt-4.1': '#3b82f6',
  'gpt-4o-mini': '#1e40af',
  'gpt-3.5-turbo': '#60a5fa',
  'other': '#6b7280'
};

const CHAT_MODE_COLORS = {
  'edit': '#3b82f6',
  'ask': '#60a5fa',
  'agent': '#93c5fd',
  'custom': '#06b6d4',
  'inline': '#8b5cf6'
};

const ChatModelCharts = ({ summary }) => {
  const chatModelData = useMemo(() => {
    if (!summary?.modelBreakdown) return { pieData: [], barData: [], models: [] };

    console.log('ChatModelCharts - modelBreakdown:', summary.modelBreakdown);

    // Process model breakdown - expecting keys in format "model|feature"
    const modelTotals = {};
    const modelByMode = {};

    Object.entries(summary.modelBreakdown).forEach(([key, data]) => {
      // Handle both "model|feature" and standalone model formats
      const parts = key.includes('|') ? key.split('|') : [key, 'unknown'];
      const model = parts[0];
      const feature = parts[1] ? parts[1].toLowerCase() : 'unknown';

      console.log('Processing:', { key, model, feature, data });

      // Only process chat-related features
      // Chat features include: chat_panel, chat_insert, chat_edit, etc.
      if (!feature.includes('chat') && !feature.includes('panel')) {
        console.log('Skipping non-chat feature:', feature);
        return;
      }

      // Determine chat mode from feature name
      let mode = 'Other';
      if (feature.includes('edit')) mode = 'Edit';
      else if (feature.includes('ask')) mode = 'Ask';
      else if (feature.includes('agent')) mode = 'Agent';
      else if (feature.includes('custom')) mode = 'Custom';
      else if (feature.includes('inline')) mode = 'Inline';
      else {
        console.log('Unknown chat mode for feature:', feature);
        return; // Skip features we can't categorize
      }

      const interactions = data.interactions || 0;
      if (interactions === 0) return;

      console.log('Adding to mode:', mode, 'model:', model, 'interactions:', interactions);

      // Aggregate total by model (for pie chart)
      if (!modelTotals[model]) {
        modelTotals[model] = 0;
      }
      modelTotals[model] += interactions;

      // Aggregate by model and mode (for bar chart)
      if (!modelByMode[model]) {
        modelByMode[model] = {};
      }
      if (!modelByMode[model][mode]) {
        modelByMode[model][mode] = 0;
      }
      modelByMode[model][mode] += interactions;
    });

    console.log('Final modelTotals:', modelTotals);
    console.log('Final modelByMode:', modelByMode);

    // If no chat data found, return empty
    if (Object.keys(modelTotals).length === 0) {
      return { pieData: [], barData: [], models: [] };
    }

    // Prepare pie chart data
    const pieData = Object.entries(modelTotals)
      .map(([model, count]) => ({
        name: model,
        value: count,
        percentage: 0 // Will calculate after
      }))
      .sort((a, b) => b.value - a.value);

    const totalInteractions = pieData.reduce((sum, item) => sum + item.value, 0);
    pieData.forEach(item => {
      item.percentage = totalInteractions > 0 
        ? ((item.value / totalInteractions) * 100).toFixed(1)
        : 0;
    });

    // Group smaller models into "Other"
    const topModels = pieData.slice(0, 4);
    const otherModels = pieData.slice(4);
    const finalPieData = [...topModels];
    
    if (otherModels.length > 0) {
      const otherTotal = otherModels.reduce((sum, item) => sum + item.value, 0);
      const otherPercentage = totalInteractions > 0
        ? ((otherTotal / totalInteractions) * 100).toFixed(1)
        : 0;
      finalPieData.push({
        name: 'Other models',
        value: otherTotal,
        percentage: otherPercentage
      });
    }

    // Prepare bar chart data
    const allModes = new Set();
    Object.values(modelByMode).forEach(modes => {
      Object.keys(modes).forEach(mode => allModes.add(mode));
    });

    const barData = Array.from(allModes).map(mode => {
      const dataPoint = { mode };
      Object.keys(modelByMode).forEach(model => {
        dataPoint[model] = modelByMode[model][mode] || 0;
      });
      return dataPoint;
    }).filter(item => {
      // Filter out modes with no data
      const total = Object.keys(item).reduce((sum, key) => {
        if (key === 'mode') return sum;
        return sum + (item[key] || 0);
      }, 0);
      return total > 0;
    });

    return { pieData: finalPieData, barData, models: Object.keys(modelTotals) };
  }, [summary]);

  const getColor = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('claude')) return COLORS['claude-sonnet-4'];
    if (lowerName.includes('gpt-4o-mini')) return COLORS['gpt-4o-mini'];
    if (lowerName.includes('gpt-4o')) return COLORS['gpt-4o'];
    if (lowerName.includes('gpt-4.1') || lowerName.includes('gpt-4-1')) return COLORS['gpt-4.1'];
    if (lowerName.includes('gpt-3.5')) return COLORS['gpt-3.5-turbo'];
    return COLORS['other'];
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 3) return null; // Don't show label for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  if (!summary || chatModelData.pieData.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Pie Chart - Chat Model Usage */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-2">Chat model usage</h2>
        <p className="text-sm text-gray-400 mb-4">
          Distribution of models across all chat modes
        </p>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chatModelData.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                innerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {chatModelData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#f3f4f6' }}
                formatter={(value) => value.toLocaleString()}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="mt-6 w-full max-w-md">
            {chatModelData.pieData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 hover:bg-gray-700 rounded transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: getColor(entry.name) }}
                  />
                  <span className="text-sm text-gray-300">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-100">{entry.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart - Model Usage per Chat Mode */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-2">Model usage per chat mode</h2>
        <p className="text-sm text-gray-400 mb-4">
          Most used models by chat mode
        </p>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chatModelData.barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="mode" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 14 }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#f3f4f6' }}
                formatter={(value) => value.toLocaleString()}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
                formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '13px' }}>{value}</span>}
              />
              {chatModelData.models.map((model, index) => (
                <Bar 
                  key={model} 
                  dataKey={model} 
                  stackId="a" 
                  fill={getColor(model)}
                  radius={index === chatModelData.models.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChatModelCharts;
