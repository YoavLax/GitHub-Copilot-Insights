/**
 * Parse NDJSON file content and return array of user metrics
 */
export const parseNDJSON = (content) => {
  try {
    const lines = content.trim().split('\n').filter(line => line.trim());
    return lines.map(line => JSON.parse(line));
  } catch (error) {
    console.error('Error parsing NDJSON:', error);
    throw new Error('Invalid NDJSON format');
  }
};

/**
 * Calculate aggregate metrics from user data
 */
export const calculateSummaryMetrics = (userData) => {
  if (!userData || userData.length === 0) {
    return null;
  }

  // Track unique users across all records
  const uniqueUsers = new Set();
  const usersWithAgent = new Set();
  const usersWithChat = new Set();
  const usersPerIDE = {};

  const summary = {
    totalUsers: 0,
    totalInteractions: 0,
    totalCodeGeneration: 0,
    totalCodeAcceptance: 0,
    totalLocSuggested: 0,
    totalLocAdded: 0,
    totalLocDeleted: 0,
    usersWithAgent: 0,
    usersWithChat: 0,
    ideBreakdown: {},
    featureBreakdown: {},
    modelBreakdown: {},
    languageBreakdown: {},
    dateRange: {
      start: null,
      end: null
    }
  };

  userData.forEach(user => {
    // Track unique users
    uniqueUsers.add(user.user_id);

    summary.totalInteractions += user.user_initiated_interaction_count || 0;
    summary.totalCodeGeneration += user.code_generation_activity_count || 0;
    summary.totalCodeAcceptance += user.code_acceptance_activity_count || 0;
    summary.totalLocSuggested += user.loc_suggested_to_add_sum || 0;
    summary.totalLocAdded += user.loc_added_sum || 0;
    summary.totalLocDeleted += user.loc_deleted_sum || 0;

    // Track agent and chat users (unique)
    if (user.used_agent) usersWithAgent.add(user.user_id);
    if (user.used_chat) usersWithChat.add(user.user_id);

    // IDE breakdown
    if (user.totals_by_ide) {
      user.totals_by_ide.forEach(ide => {
        const ideName = ide.ide;
        if (!summary.ideBreakdown[ideName]) {
          summary.ideBreakdown[ideName] = {
            users: new Set(),
            interactions: 0,
            codeGeneration: 0,
            codeAcceptance: 0
          };
        }
        summary.ideBreakdown[ideName].users.add(user.user_id);
        summary.ideBreakdown[ideName].interactions += ide.user_initiated_interaction_count || 0;
        summary.ideBreakdown[ideName].codeGeneration += ide.code_generation_activity_count || 0;
        summary.ideBreakdown[ideName].codeAcceptance += ide.code_acceptance_activity_count || 0;
      });
    }

    // Feature breakdown
    if (user.totals_by_feature) {
      user.totals_by_feature.forEach(feature => {
        const featureName = feature.feature;
        if (!summary.featureBreakdown[featureName]) {
          summary.featureBreakdown[featureName] = {
            interactions: 0,
            codeGeneration: 0,
            codeAcceptance: 0
          };
        }
        summary.featureBreakdown[featureName].interactions += feature.user_initiated_interaction_count || 0;
        summary.featureBreakdown[featureName].codeGeneration += feature.code_generation_activity_count || 0;
        summary.featureBreakdown[featureName].codeAcceptance += feature.code_acceptance_activity_count || 0;
      });
    }

    // Model breakdown
    if (user.totals_by_model_feature) {
      user.totals_by_model_feature.forEach(modelFeature => {
        const modelName = modelFeature.model;
        const featureName = modelFeature.feature;
        const key = `${modelName}|${featureName}`;
        
        if (!summary.modelBreakdown[key]) {
          summary.modelBreakdown[key] = {
            model: modelName,
            feature: featureName,
            interactions: 0,
            codeGeneration: 0,
            codeAcceptance: 0
          };
        }
        summary.modelBreakdown[key].interactions += modelFeature.user_initiated_interaction_count || 0;
        summary.modelBreakdown[key].codeGeneration += modelFeature.code_generation_activity_count || 0;
        summary.modelBreakdown[key].codeAcceptance += modelFeature.code_acceptance_activity_count || 0;
      });
    }

    // Language breakdown
    if (user.totals_by_language_feature) {
      user.totals_by_language_feature.forEach(lang => {
        const langName = lang.language;
        if (langName === 'unknown') return;
        if (!summary.languageBreakdown[langName]) {
          summary.languageBreakdown[langName] = {
            users: new Set(),
            codeGeneration: 0,
            codeAcceptance: 0
          };
        }
        summary.languageBreakdown[langName].users.add(user.user_id);
        summary.languageBreakdown[langName].codeGeneration += lang.code_generation_activity_count || 0;
        summary.languageBreakdown[langName].codeAcceptance += lang.code_acceptance_activity_count || 0;
      });
    }

    // Date range
    if (user.day) {
      if (!summary.dateRange.start || user.day < summary.dateRange.start) {
        summary.dateRange.start = user.day;
      }
      if (!summary.dateRange.end || user.day > summary.dateRange.end) {
        summary.dateRange.end = user.day;
      }
    }
  });

  // Set unique user counts
  summary.totalUsers = uniqueUsers.size;
  summary.usersWithAgent = usersWithAgent.size;
  summary.usersWithChat = usersWithChat.size;

  // Convert IDE user Sets to counts
  Object.keys(summary.ideBreakdown).forEach(ide => {
    summary.ideBreakdown[ide].users = summary.ideBreakdown[ide].users.size;
  });

  // Convert Language user Sets to counts
  Object.keys(summary.languageBreakdown).forEach(lang => {
    summary.languageBreakdown[lang].users = summary.languageBreakdown[lang].users.size;
  });

  // Calculate acceptance rate
  summary.acceptanceRate = summary.totalCodeGeneration > 0
    ? ((summary.totalCodeAcceptance / summary.totalCodeGeneration) * 100).toFixed(2)
    : 0;

  return summary;
};

/**
 * Process user data for table display - aggregated by user across all dates
 */
export const processUserTableData = (userData) => {
  // Group data by user_id
  const userMap = new Map();

  userData.forEach(record => {
    const userId = record.user_id;
    
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId: userId,
        userLogin: record.user_login,
        dates: [],
        interactions: 0,
        codeGeneration: 0,
        codeAcceptance: 0,
        locSuggested: 0,
        locAdded: 0,
        locDeleted: 0,
        usedAgent: false,
        usedChat: false,
        ides: new Set(),
        ideVersions: new Set(),
        pluginVersions: new Set()
      });
    }

    const user = userMap.get(userId);
    
    // Aggregate dates
    user.dates.push(record.day);
    
    // Sum metrics
    user.interactions += record.user_initiated_interaction_count || 0;
    user.codeGeneration += record.code_generation_activity_count || 0;
    user.codeAcceptance += record.code_acceptance_activity_count || 0;
    user.locSuggested += record.loc_suggested_to_add_sum || 0;
    user.locAdded += record.loc_added_sum || 0;
    user.locDeleted += record.loc_deleted_sum || 0;
    
    // Track feature usage
    if (record.used_agent) user.usedAgent = true;
    if (record.used_chat) user.usedChat = true;
    
    // Track IDE info
    if (record.totals_by_ide) {
      record.totals_by_ide.forEach(ide => {
        if (ide.ide) user.ides.add(ide.ide);
        if (ide.ide_version) user.ideVersions.add(ide.ide_version);
        if (ide.last_known_plugin_version?.plugin_version) {
          user.pluginVersions.add(ide.last_known_plugin_version.plugin_version);
        }
      });
    }
  });

  // Convert map to array and calculate derived fields
  return Array.from(userMap.values()).map(user => {
    const acceptanceRate = user.codeGeneration > 0
      ? ((user.codeAcceptance / user.codeGeneration) * 100).toFixed(1)
      : 0;

    // Sort dates to get range
    const sortedDates = user.dates.sort();
    const dateRange = sortedDates.length > 1 
      ? `${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`
      : sortedDates[0] || 'N/A';

    return {
      userId: user.userId,
      userLogin: user.userLogin,
      dateRange: dateRange,
      daysActive: user.dates.length,
      ide: Array.from(user.ides).join(', ') || 'N/A',
      ideVersion: Array.from(user.ideVersions).join(', ') || 'N/A',
      pluginVersion: Array.from(user.pluginVersions).join(', ') || 'N/A',
      interactions: user.interactions,
      codeGeneration: user.codeGeneration,
      codeAcceptance: user.codeAcceptance,
      acceptanceRate: acceptanceRate,
      locSuggested: user.locSuggested,
      locAdded: user.locAdded,
      locDeleted: user.locDeleted,
      usedAgent: user.usedAgent,
      usedChat: user.usedChat
    };
  });
};

/**
 * Store data in localStorage
 */
export const saveToCache = (data) => {
  try {
    localStorage.setItem('copilot_metrics_data', JSON.stringify(data));
    localStorage.setItem('copilot_metrics_timestamp', new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error);
    return false;
  }
};

/**
 * Load data from localStorage
 */
export const loadFromCache = () => {
  try {
    const data = localStorage.getItem('copilot_metrics_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from cache:', error);
    return null;
  }
};

/**
 * Clear cache
 */
export const clearCache = () => {
  try {
    localStorage.removeItem('copilot_metrics_data');
    localStorage.removeItem('copilot_metrics_timestamp');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

/**
 * Get cache timestamp
 */
export const getCacheTimestamp = () => {
  return localStorage.getItem('copilot_metrics_timestamp');
};

/**
 * Calculate daily active users
 */
export const calculateDailyActiveUsers = (userData) => {
  const dailyUsers = new Map();

  userData.forEach(record => {
    const date = record.day;
    if (!dailyUsers.has(date)) {
      dailyUsers.set(date, new Set());
    }
    dailyUsers.get(date).add(record.user_id);
  });

  return Array.from(dailyUsers.entries())
    .map(([date, users]) => ({
      date,
      users: users.size
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Calculate weekly active users
 */
export const calculateWeeklyActiveUsers = (userData) => {
  const weeklyUsers = new Map();

  userData.forEach(record => {
    const date = new Date(record.day);
    // Get ISO week start (Monday)
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(date.setDate(diff));
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyUsers.has(weekKey)) {
      weeklyUsers.set(weekKey, new Set());
    }
    weeklyUsers.get(weekKey).add(record.user_id);
  });

  return Array.from(weeklyUsers.entries())
    .map(([week, users]) => ({
      week,
      users: users.size
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
};

/**
 * Calculate average chat requests per active user per day
 */
export const calculateAverageChatRequests = (userData) => {
  const dailyData = new Map();

  userData.forEach(record => {
    const date = record.day;
    
    if (!dailyData.has(date)) {
      dailyData.set(date, {
        users: new Set(),
        totalRequests: 0
      });
    }

    const dayData = dailyData.get(date);
    dayData.users.add(record.user_id);
    
    // Sum chat interactions from totals_by_feature
    if (record.totals_by_feature) {
      record.totals_by_feature.forEach(feature => {
        // Count chat features, exclude code completions
        if (feature.feature && feature.feature.includes('chat')) {
          dayData.totalRequests += feature.user_initiated_interaction_count || 0;
        }
      });
    }
  });

  return Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      avgRequests: data.users.size > 0 ? data.totalRequests / data.users.size : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
