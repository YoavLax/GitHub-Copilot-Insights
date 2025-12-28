import React, { useState } from 'react';

const LanguageDetailsTable = ({ languageBreakdown }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'acceptances', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  if (!languageBreakdown || Object.keys(languageBreakdown).length === 0) {
    return null;
  }

  // Transform data into table rows with calculated fields
  const languageData = Object.entries(languageBreakdown)
    .filter(([language]) => language !== 'unknown')
    .map(([language, stats]) => ({
      language: language.charAt(0).toUpperCase() + language.slice(1),
      users: stats.users || 0,
      suggestions: stats.codeGeneration || 0,
      acceptances: stats.codeAcceptance || 0,
      acceptanceRate: stats.codeGeneration > 0 
        ? ((stats.codeAcceptance / stats.codeGeneration) * 100) 
        : 0
    }));

  // Filter by search term
  const filteredData = languageData.filter(item =>
    item.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'desc' ? (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-blue transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gradient">Language Details</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search languages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <p className="text-sm text-slate-400 mb-4">
        Comprehensive breakdown of AI suggestions and acceptances by programming language
      </p>

      <div className="overflow-x-auto max-h-[480px] overflow-y-auto border border-slate-800 rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
            <tr className="border-b border-slate-700">
              <th 
                className="text-left py-3 px-4 font-semibold text-slate-300 cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => handleSort('language')}
              >
                <div className="flex items-center gap-2">
                  Language
                  <SortIcon columnKey="language" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-semibold text-slate-300 cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => handleSort('users')}
              >
                <div className="flex items-center justify-end gap-2">
                  Users
                  <SortIcon columnKey="users" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-semibold text-slate-300 cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => handleSort('suggestions')}
              >
                <div className="flex items-center justify-end gap-2">
                  Suggestions
                  <SortIcon columnKey="suggestions" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-semibold text-slate-300 cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => handleSort('acceptances')}
              >
                <div className="flex items-center justify-end gap-2">
                  Acceptances
                  <SortIcon columnKey="acceptances" />
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-semibold text-slate-300 cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => handleSort('acceptanceRate')}
              >
                <div className="flex items-center justify-end gap-2">
                  Acceptance Rate
                  <SortIcon columnKey="acceptanceRate" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr 
                key={row.language} 
                className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${
                  index % 2 === 0 ? 'bg-slate-900/20' : ''
                }`}
              >
                <td className="py-3 px-4 text-slate-300 font-medium">
                  {row.language}
                </td>
                <td className="py-3 px-4 text-right text-slate-400">
                  {row.users.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-slate-400">
                  {formatNumber(row.suggestions)}
                </td>
                <td className="py-3 px-4 text-right text-slate-400">
                  {formatNumber(row.acceptances)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.acceptanceRate >= 80 ? 'bg-green-900/30 text-green-400' :
                    row.acceptanceRate >= 60 ? 'bg-blue-900/30 text-blue-400' :
                    row.acceptanceRate >= 40 ? 'bg-orange-900/30 text-orange-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {row.acceptanceRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">
                  No languages found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sortedData.length > 0 && (
        <div className="mt-4 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {sortedData.length} of {languageData.length} languages</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              <span>Excellent (80%+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
              <span>Good (60-80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
              <span>Fair (40-60%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <span>Low (&lt;40%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDetailsTable;
