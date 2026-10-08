'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, Activity } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { PerformanceChart } from '@/components/PerformanceChart';
import { TeamRadarChart } from '@/components/TeamRadarChart';
import Scene from '@/components/Scene';
import Magnetic from '@/components/Magnetic';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'football' | 'nba' | 'nfl'>('football');
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const headerRef = useRef<HTMLElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let endpoint = '';
        if (activeTab === 'football') endpoint = '/api/standings/football/u18';
        else if (activeTab === 'nba') endpoint = '/api/standings/nba';
        else if (activeTab === 'nfl') endpoint = '/api/standings/nfl';
          
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setTableData(data);

        const chartRes = await fetch(`/api/performance/${activeTab}`);
        if (!chartRes.ok) throw new Error('Network response for chart was not ok');
        const cData = await chartRes.json();
        setChartData(cData);
      } catch (error) {
        console.warn("Failed to fetch data, using mock data:", error);
        
        // Provide mock data so the UI doesn't look empty when backend is off
        if (activeTab === 'football') {
          setTableData([
            { team_name: 'Academy City', matches_played: 10, wins: 8, draws: 1, losses: 1, points: 25 },
            { team_name: 'Metro United', matches_played: 10, wins: 7, draws: 2, losses: 1, points: 23 },
          ]);
        } else if (activeTab === 'nba') {
          setTableData([
            { team_name: 'Lakers', wins: 45, losses: 37, win_pct: 0.549, pts_per_game: 115, opp_pts_per_game: 112 },
            { team_name: 'Warriors', wins: 44, losses: 38, win_pct: 0.537, pts_per_game: 118, opp_pts_per_game: 117 },
          ]);
        } else if (activeTab === 'nfl') {
          setTableData([
            { team_name: 'Chiefs', wins: 14, losses: 3, ties: 0, points_for: 400, points_against: 300 },
            { team_name: '49ers', wins: 13, losses: 4, ties: 0, points_for: 390, points_against: 290 },
          ]);
        }

        setChartData([
          { match: 'Week 1', points: 3 },
          { match: 'Week 2', points: 6 },
          { match: 'Week 3', points: 7 },
          { match: 'Week 4', points: 10 },
          { match: 'Week 5', points: 13 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (headerRef.current && bentoRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.hero-text',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out', delay: 0.2 }
        );
        
        gsap.fromTo(bentoRef.current!.children,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out', delay: 0.5, scrollTrigger: {
              trigger: bentoRef.current,
              start: 'top 85%',
          }}
        );
      }, [headerRef, bentoRef]);

      return () => ctx.revert();
    }
  }, []);

  const footballColumns = [
    { key: 'team_name', label: 'Team' },
    { key: 'matches_played', label: 'MP', align: 'center' as const },
    { key: 'wins', label: 'W', align: 'center' as const },
    { key: 'draws', label: 'D', align: 'center' as const },
    { key: 'losses', label: 'L', align: 'center' as const },
    { key: 'points', label: 'Pts', align: 'right' as const },
  ];

  const nbaColumns = [
    { key: 'team_name', label: 'Team' },
    { key: 'wins', label: 'W', align: 'center' as const },
    { key: 'losses', label: 'L', align: 'center' as const },
    { key: 'win_pct', label: 'Win %', align: 'center' as const },
    { key: 'pts_per_game', label: 'PPG', align: 'center' as const },
    { key: 'opp_pts_per_game', label: 'OPP PPG', align: 'center' as const },
  ];

  const nflColumns = [
    { key: 'team_name', label: 'Team' },
    { key: 'wins', label: 'W', align: 'center' as const },
    { key: 'losses', label: 'L', align: 'center' as const },
    { key: 'ties', label: 'T', align: 'center' as const },
    { key: 'points_for', label: 'PF', align: 'center' as const },
    { key: 'points_against', label: 'PA', align: 'center' as const },
  ];

  const topPerformer = tableData.length > 0 ? tableData[0].team_name : 'N/A';
  
  let avgStatLabel = '';
  let avgStatValue = '0';
  if (activeTab === 'football') {
    avgStatLabel = 'League Avg Points';
    avgStatValue = tableData.length > 0 ? (tableData.reduce((acc, row) => acc + (row.points || 0), 0) / tableData.length).toFixed(1) : '0';
  } else if (activeTab === 'nba') {
    avgStatLabel = 'Avg PPG';
    avgStatValue = tableData.length > 0 ? (tableData.reduce((acc, row) => acc + (row.pts_per_game || 0), 0) / tableData.length).toFixed(1) : '0';
  } else if (activeTab === 'nfl') {
    avgStatLabel = 'Avg Points For';
    avgStatValue = tableData.length > 0 ? (tableData.reduce((acc, row) => acc + (row.points_for || 0), 0) / tableData.length).toFixed(1) : '0';
  }

  const themeColor = activeTab === 'nba' ? '#f97316' : activeTab === 'nfl' ? '#8b4513' : '#3b82f6';

  return (
    <>
      <Scene activeTab={activeTab} />
      
      <div className="relative z-10 w-full min-h-screen pt-32 pb-24 px-6 md:px-12 lg:px-24">
        
        <header ref={headerRef} className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="max-w-3xl">
            <h1 className="hero-text text-5xl md:text-7xl lg:text-[7rem] leading-[0.9] font-bold tracking-tighter mix-blend-difference text-white mb-6 uppercase">
              DataTurf<br/>
              <span style={{ color: themeColor }}>Analytics</span>
            </h1>
            <p className="hero-text text-lg md:text-xl text-[#f0f0f0] max-w-xl border-l-2 pl-6 ml-1 opacity-80 mix-blend-difference" style={{ borderColor: themeColor }}>
              The premier aggregation engine for high-performance sports. Precision data, real-time leaderboard, absolute clarity.
            </p>
          </div>

          <div className="hero-text flex bg-[rgba(20,20,20,0.6)] backdrop-blur-md rounded-full p-1.5 border border-white/10 overflow-x-auto whitespace-nowrap max-w-full">
            <Magnetic>
              <button
                onClick={() => setActiveTab('football')}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'football' 
                    ? 'bg-[#f0f0f0] text-black shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Soccer
              </button>
            </Magnetic>
            <Magnetic>
              <button
                onClick={() => setActiveTab('nba')}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'nba' 
                    ? 'bg-[#f0f0f0] text-black shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="w-4 h-4" />
                NBA
              </button>
            </Magnetic>
            <Magnetic>
              <button
                onClick={() => setActiveTab('nfl')}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'nfl' 
                    ? 'bg-[#f0f0f0] text-black shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="w-4 h-4" />
                NFL
              </button>
            </Magnetic>
          </div>
        </header>

        <main ref={bentoRef} className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(180px,auto)] gap-4 md:gap-6">
          
          {/* Main Table Bento */}
          <div className="md:col-span-8 md:row-span-2 glass-card rounded-3xl p-6 md:p-10 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-white uppercase flex items-center gap-4">
                {activeTab === 'football' ? 'League Standings' : 'Live Leaderboard'}
              </h2>
              <span className="px-4 py-1.5 bg-white/5 rounded-full text-xs font-bold uppercase tracking-widest text-white border border-white/10 flex items-center gap-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse"></span>
                Live
              </span>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <DataTable 
                columns={activeTab === 'football' ? footballColumns : activeTab === 'nba' ? nbaColumns : nflColumns}
                data={tableData}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Top Performer Bento */}
          <div className="md:col-span-4 glass-card rounded-3xl p-6 md:p-10 hover-lift group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors" style={{ backgroundColor: themeColor, opacity: 0.2 }}></div>
            <div>
              <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Top Performer</div>
              <div className="text-3xl md:text-5xl font-bold text-white tracking-tighter leading-none break-words">
                {!isLoading ? topPerformer : '...'}
              </div>
            </div>
            <div className="mt-8 flex items-center transition-colors" style={{ color: themeColor }}>
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          {/* Average Stat Bento */}
          <div className="md:col-span-4 glass-card rounded-3xl p-6 md:p-10 hover-lift group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
            <div>
              <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
                {avgStatLabel}
              </div>
              <div className="text-5xl md:text-7xl font-bold text-[#f0f0f0] tracking-tighter">
                {!isLoading ? avgStatValue : '...'}
              </div>
            </div>
          </div>

          {/* Chart Bento */}
          <div className="md:col-span-12 glass-card rounded-3xl p-6 md:p-10 min-h-[400px] flex flex-col">
             <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white uppercase">Performance Trend</h2>
            </div>
            <div className="flex-1 w-full relative">
              {activeTab === 'football' ? (
                <PerformanceChart 
                  data={chartData} 
                  dataKey="points" 
                  xAxisKey="match" 
                  isLoading={isLoading}
                  color={themeColor}
                />
              ) : (
                <TeamRadarChart
                  data={chartData}
                  isLoading={isLoading}
                  color={themeColor}
                />
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
