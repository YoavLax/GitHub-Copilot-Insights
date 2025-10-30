import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import SummaryDashboard from './components/SummaryDashboard';
import UserTable from './components/UserTable';
import ChatModelCharts from './components/ChatModelCharts';
import {
  parseNDJSON,
  calculateSummaryMetrics,
  processUserTableData,
  calculateDailyActiveUsers,
  calculateWeeklyActiveUsers,
  calculateAverageChatRequests,
  saveToCache,
  loadFromCache,
  clearCache,
  getCacheTimestamp,
} from './utils/dataProcessor';
import { getMetrics, uploadMetrics, clearMetrics } from './utils/api';

function App() {
  const [userData, setUserData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load metrics on mount (try backend first, fall back to localStorage)
  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to load from backend API first
      try {
        console.log('Attempting to load metrics from backend API...');
        const content = await getMetrics();
        
        if (content) {
          console.log('Loaded metrics from backend, parsing...');
          const parsedData = parseNDJSON(content);
          console.log('Parsed data:', parsedData?.length, 'records');
          processMetrics(parsedData);
          setLastUpdated(new Date().toISOString());
          return; // Successfully loaded from backend
        }
      } catch (apiError) {
        console.log('Backend API not available, falling back to localStorage:', apiError.message);
      }
      
      // Fall back to localStorage
      const localData = loadFromCache();
      if (localData && localData.length > 0) {
        console.log('Loaded metrics from localStorage:', localData.length, 'records');
        processMetrics(localData);
        setLastUpdated(getCacheTimestamp() || new Date().toISOString());
      } else {
        console.log('No metrics data available');
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setError('Failed to load metrics: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processMetrics = (parsedData) => {
    setUserData(parsedData);
    const summaryMetrics = calculateSummaryMetrics(parsedData);
    summaryMetrics.dailyActiveUsers = calculateDailyActiveUsers(parsedData);
    summaryMetrics.weeklyActiveUsers = calculateWeeklyActiveUsers(parsedData);
    summaryMetrics.avgChatRequests = calculateAverageChatRequests(parsedData);
    setSummary(summaryMetrics);
    setTableData(processUserTableData(parsedData));
  };

  const handleFileLoad = async (content) => {
    setIsLoading(true);
    setError(null);

    try {
      // Parse NDJSON locally first to validate
      const parsedData = parseNDJSON(content);
      
      if (!parsedData || parsedData.length === 0) {
        throw new Error('No data found in file');
      }

      // Try to upload to backend API if available
      try {
        const blob = new Blob([content], { type: 'application/x-ndjson' });
        const file = new File([blob], 'metrics.ndjson', { type: 'application/x-ndjson' });
        await uploadMetrics(file);
        console.log('Uploaded metrics to backend API');
      } catch (apiError) {
        console.log('Backend API not available, using localStorage:', apiError.message);
      }

      // Always save to localStorage as backup
      saveToCache(parsedData);

      // Process and display metrics
      processMetrics(parsedData);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all metrics data?')) {
      try {
        setIsLoading(true);
        
        // Try to clear from backend API
        try {
          await clearMetrics();
          console.log('Cleared metrics from backend API');
        } catch (apiError) {
          console.log('Backend API not available:', apiError.message);
        }
        
        // Always clear localStorage
        clearCache();
        
        setUserData(null);
        setSummary(null);
        setTableData([]);
        setLastUpdated(null);
        setError(null);
      } catch (err) {
        console.error('Error clearing data:', err);
        setError('Failed to clear data');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-1">
                GitHub Copilot Metrics
              </h1>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                AI-Powered Analytics Dashboard
              </p>
            </div>
            {userData && (
              <button
                onClick={handleClearData}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-red-500/25"
              >
                Clear Data
              </button>
            )}
          </div>
          {lastUpdated && (
            <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Last updated: {formatTimestamp(lastUpdated)}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Processing data...</p>
          </div>
        )}

        {!userData && !isLoading && (
          <div className="py-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gradient mb-4">
                Welcome to Copilot Metrics
              </h2>
              <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                Upload your GitHub Copilot usage metrics export file to visualize adoption,
                track engagement, and analyze AI-assisted development across your organization.
              </p>
            </div>
            <FileUpload onFileLoad={handleFileLoad} />
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="glass-effect rounded-xl p-8 glow-blue">
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  How to get your metrics file:
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-300 text-sm">
                  <li className="pl-2">Go to your GitHub Enterprise settings</li>
                  <li className="pl-2">Navigate to Copilot &gt; Usage metrics</li>
                  <li className="pl-2">Export your usage data as NDJSON format</li>
                  <li className="pl-2">Upload the file here to visualize your metrics</li>
                </ol>
                <p className="mt-6 text-sm text-slate-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <a 
                    href="https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/copilot-usage-metrics" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors underline"
                  >
                    Learn more about Copilot usage metrics
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {userData && !isLoading && (
          <div className="space-y-8">
            {/* Upload New File Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gradient">Metrics Overview</h2>
              <label className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-medium cursor-pointer shadow-lg hover:shadow-blue-500/25 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Upload New File
                <input
                  type="file"
                  className="hidden"
                  accept=".ndjson,.json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const text = await file.text();
                      handleFileLoad(text);
                    }
                  }}
                />
              </label>
            </div>

            {/* Summary Dashboard */}
            <SummaryDashboard summary={summary} />

            {/* Chat Model Analytics */}
            <ChatModelCharts summary={summary} />

            {/* User Table */}
            <UserTable users={tableData} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-effect border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-400">
            GitHub Copilot Metrics Portal • Built with <span className="text-gradient font-semibold">React + Vite + Tailwind CSS</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
