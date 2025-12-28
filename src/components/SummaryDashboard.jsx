import React from 'react';
import LanguagePieChart from './LanguagePieChart';
import ModelBarChart from './ModelBarChart';
import IdeBarChart from './IdeBarChart';
import FeatureBarChart from './FeatureBarChart';
import DailyActiveUsersChart from './DailyActiveUsersChart';
import WeeklyActiveUsersChart from './WeeklyActiveUsersChart';
import AverageChatRequestsChart from './AverageChatRequestsChart';
import ModelAcceptanceRateChart from './ModelAcceptanceRateChart';
import LanguageAcceptanceRateChart from './LanguageAcceptanceRateChart';
import TopLanguagesByAcceptancesChart from './TopLanguagesByAcceptancesChart';
import EditorUsageChart from './EditorUsageChart';
import LanguageDetailsTable from './LanguageDetailsTable';

const MetricCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="glass-effect rounded-xl p-6 hover:glow-blue transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 group-hover:text-blue-400 transition-colors">{title}</p>
          <p className="text-4xl font-bold text-gradient mt-3">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-2">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm mt-2 font-semibold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryDashboard = ({ summary }) => {
  if (!summary) {
    return null;
  }

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  return (
    <div className="space-y-6">
      {/* Date Range */}
      {summary.dateRange.start && (
        <div className="glass-effect border border-blue-500/30 rounded-xl p-4 glow-blue">
          <p className="text-sm text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-blue-400">Data Period:</span> {summary.dateRange.start} to {summary.dateRange.end}
          </p>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Active Users"
          value={formatNumber(summary.totalUsers)}
          subtitle="Unique users with activity"
        />
        <MetricCard
          title="Agent Adoption"
          value={formatNumber(summary.usersWithAgent)}
          subtitle={`${((summary.usersWithAgent / summary.totalUsers) * 100).toFixed(1)}% of total users`}
        />
        <MetricCard
          title="User Interactions"
          value={formatNumber(summary.totalInteractions)}
          subtitle="Total user-initiated interactions"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Code Acceptances"
          value={formatNumber(summary.totalCodeAcceptance)}
          subtitle="AI suggestions accepted"
        />
        <MetricCard
          title="Chat Users"
          value={formatNumber(summary.usersWithChat)}
          subtitle={`${((summary.usersWithChat / summary.totalUsers) * 100).toFixed(1)}% of total users`}
        />
      </div>

      {/* Lines of Code Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Lines Added by Copilot"
          value={formatNumber(summary.totalLocAdded)}
          subtitle="LOC added via AI suggestions"
        />
        <MetricCard
          title="Lines Deleted by Copilot"
          value={formatNumber(summary.totalLocDeleted)}
          subtitle="LOC removed via AI suggestions"
        />
      </div>

      {/* Time Series Charts */}
      {(summary.dailyActiveUsers || summary.weeklyActiveUsers || summary.avgChatRequests) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {summary.dailyActiveUsers && (
            <DailyActiveUsersChart dailyData={summary.dailyActiveUsers} />
          )}
          {summary.weeklyActiveUsers && (
            <WeeklyActiveUsersChart weeklyData={summary.weeklyActiveUsers} />
          )}
        </div>
      )}
      
      {summary.avgChatRequests && (
        <div className="grid grid-cols-1 gap-6">
          <AverageChatRequestsChart dailyData={summary.avgChatRequests} />
        </div>
      )}

      {/* Charts Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Languages by Acceptances */}
        {Object.keys(summary.languageBreakdown).length > 0 && (
          <TopLanguagesByAcceptancesChart languageBreakdown={summary.languageBreakdown} />
        )}

        {/* Editor Usage */}
        <EditorUsageChart ideBreakdown={summary.ideBreakdown} />

        {/* IDE Breakdown */}
        <IdeBarChart ideBreakdown={summary.ideBreakdown} />

        {/* Feature Breakdown */}
        <FeatureBarChart featureBreakdown={summary.featureBreakdown} />

        {/* Model Breakdown */}
        <ModelBarChart modelBreakdown={summary.modelBreakdown} />

        {/* Model Acceptance Rate */}
        <ModelAcceptanceRateChart modelBreakdown={summary.modelBreakdown} />

        {/* Language Breakdown */}
        {Object.keys(summary.languageBreakdown).length > 0 && (
          <LanguagePieChart languageBreakdown={summary.languageBreakdown} />
        )}
        
        {/* Language Acceptance Rate */}
        {Object.keys(summary.languageBreakdown).length > 0 && (
          <LanguageAcceptanceRateChart languageBreakdown={summary.languageBreakdown} />
        )}
      </div>

      {/* Language Details Table - Full Width */}
      {Object.keys(summary.languageBreakdown).length > 0 && (
        <div className="mt-6">
          <LanguageDetailsTable languageBreakdown={summary.languageBreakdown} />
        </div>
      )}
    </div>
  );
};

export default SummaryDashboard;
