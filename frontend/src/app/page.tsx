'use client';

import { useState, useEffect } from 'react';
import { Trophy, Target, Activity } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { PerformanceChart } from '@/components/PerformanceChart';

// Mock Data


export default function Home() {
  const [activeTab, setActiveTab] = useState<'football' | 'golf'>('football');
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch real data from the backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const endpoint = activeTab === 'football' 
          ? 'http://localhost:5000/api/standings/football/u18'
          : 'http://localhost:5000/api/leaderboard/golf/pga';
          
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setTableData(data);

        // Fetch chart data
        const chartRes = await fetch(`http://localhost:5000/api/performance/${activeTab}`);
        if (!chartRes.ok) throw new Error('Network response for chart was not ok');
        const cData = await chartRes.json();
        setChartData(cData);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setTableData([]);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const footballColumns = [
    { key: 'team_name', label: 'Team' },
    { key: 'matches_played', label: 'MP', align: 'center' as const },
    { key: 'wins', label: 'W', align: 'center' as const },
    { key: 'draws', label: 'D', align: 'center' as const },
    { key: 'losses', label: 'L', align: 'center' as const },
    { key: 'points', label: 'Pts', align: 'right' as const },
  ];

  const golfColumns = [
    { key: 'position', label: 'Pos', align: 'center' as const },
    { key: 'player_name', label: 'Player' },
    { key: 'total_score', label: 'Score', align: 'center' as const },
    { key: 'rounds_played', label: 'Thru', align: 'center' as const },
  ];

  // Dynamic stats calculation
  const topPerformer = tableData.length > 0 ? (activeTab === 'football' ? tableData[0].team_name : tableData[0].player_name) : 'N/A';
  
  const avgStat = tableData.length > 0 ? (
    activeTab === 'football' 
      ? (tableData.reduce((acc, row) => acc + (row.points || 0), 0) / tableData.length).toFixed(1)
      : (tableData.reduce((acc, row) => acc + (row.total_score || 0), 0) / tableData.length).toFixed(1)
  ) : '0';

  return (
    <div className="min-h-screen p-8 sm:p-12 md:p-20 max-w-6xl mx-auto space-y-12 animate-fade-in">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30 text-emerald-400">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              DataTurf
            </h1>
            <p className="text-slate-400 mt-1">Premium Sports Analytics Aggregator</p>
          </div>
        </div>

        {/* Domain Toggles */}
        <div className="flex p-1 bg-slate-800 rounded-xl glass border border-white/5">
          <button
            onClick={() => setActiveTab('football')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'football' 
                ? 'bg-emerald-500 text-slate-900 shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Football U18
          </button>
          <button
            onClick={() => setActiveTab('golf')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'golf' 
                ? 'bg-emerald-500 text-slate-900 shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4" />
            PGA Tour
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              {activeTab === 'football' ? 'League Standings' : 'Live Leaderboard'}
            </h2>
            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Updates
            </span>
          </div>
          
          <div className="hover-lift">
            <DataTable 
              columns={activeTab === 'football' ? footballColumns : golfColumns}
              data={tableData}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Sidebar / Chart */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Performance Trend</h2>
          <div className="hover-lift">
            <PerformanceChart 
              data={chartData} 
              dataKey="points" 
              xAxisKey="match" 
              isLoading={isLoading}
              color={activeTab === 'football' ? '#10b981' : '#3b82f6'}
            />
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
             <div className="glass-card p-5 hover-lift">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Top Performer</div>
                <div className="text-lg font-bold text-white truncate">
                  {!isLoading ? topPerformer : '...'}
                </div>
             </div>
             <div className="glass-card p-5 hover-lift">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  {activeTab === 'football' ? 'Avg Points' : 'Avg Score'}
                </div>
                <div className="text-2xl font-bold text-white">
                  {!isLoading ? avgStat : '...'}
                </div>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}
