import React, { useState, useMemo } from 'react';

const UserTable = ({ users }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'interactions', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIDE, setFilterIDE] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.userLogin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // IDE filter
    if (filterIDE !== 'all') {
      filtered = filtered.filter(user => user.ide === filterIDE);
    }

    // Agent filter
    if (filterAgent === 'agent-only') {
      filtered = filtered.filter(user => user.usedAgent && !user.usedChat);
    } else if (filterAgent === 'chat-only') {
      filtered = filtered.filter(user => user.usedChat && !user.usedAgent);
    } else if (filterAgent === 'both') {
      filtered = filtered.filter(user => user.usedAgent && user.usedChat);
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      });
    }

    return filtered;
  }, [users, sortConfig, searchTerm, filterIDE, filterAgent]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const uniqueIDEs = useMemo(() => {
    return [...new Set(users.map(u => u.ide))].filter(ide => ide !== 'N/A');
  }, [users]);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-slate-600">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? <span className="text-blue-400">↑</span> : <span className="text-blue-400">↓</span>;
  };

  return (
    <div className="glass-effect rounded-xl overflow-hidden hover:glow-blue transition-all duration-300">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-gradient mb-6">User Adoption Details</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Search User
            </label>
            <input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 placeholder-slate-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Filter by IDE
            </label>
            <select
              value={filterIDE}
              onChange={(e) => setFilterIDE(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
            >
              <option value="all">All IDEs</option>
              {uniqueIDEs.map(ide => (
                <option key={ide} value={ide}>{ide}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Filter by Feature
            </label>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
            >
              <option value="all">All Features</option>
              <option value="agent-only">Agent Only</option>
              <option value="chat-only">Chat Only</option>
              <option value="both">Both Agent & Chat</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-slate-400 mt-4">
          Showing {sortedAndFilteredUsers.length} of {users.length} users
        </p>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th
                onClick={() => handleSort('userLogin')}
                className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>User</span>
                  <SortIcon columnKey="userLogin" />
                </div>
              </th>
              <th
                onClick={() => handleSort('daysActive')}
                className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Days Active</span>
                  <SortIcon columnKey="daysActive" />
                </div>
              </th>
              <th
                onClick={() => handleSort('ide')}
                className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>IDE</span>
                  <SortIcon columnKey="ide" />
                </div>
              </th>
              <th
                onClick={() => handleSort('interactions')}
                className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Interactions</span>
                  <SortIcon columnKey="interactions" />
                </div>
              </th>
              <th
                onClick={() => handleSort('locAdded')}
                className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Lines Of Code Affected</span>
                  <SortIcon columnKey="locAdded" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Features
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedAndFilteredUsers.map((user) => (
              <tr key={user.userId} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-400">{user.userLogin}</div>
                  <div className="text-xs text-slate-500">ID: {user.userId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                  {user.daysActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-200 capitalize">{user.ide}</div>
                  <div className="text-xs text-slate-500">{user.ideVersion}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 font-semibold">
                  {user.interactions.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-400 font-semibold">
                    +{user.locAdded.toLocaleString()}
                  </div>
                  {user.locDeleted > 0 && (
                    <div className="text-xs text-red-400">
                      -{user.locDeleted.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {user.usedAgent && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Agent
                      </span>
                    )}
                    {user.usedChat && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Chat
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;