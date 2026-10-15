'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, Activity } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { PerformanceChart } from '@/components/PerformanceChart';
import { MatchupAnalysis } from '@/components/MatchupAnalysis';
import { TacticsBoard } from '@/components/TacticsBoard';
import { PlayerComparison } from '@/components/PlayerComparison';
import Scene from '@/components/Scene';
import Magnetic from '@/components/Magnetic';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'football' | 'nba' | 'nfl'>('football');
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [fixturesData, setFixturesData] = useState<any[]>([]);
  const headerRef = useRef<HTMLElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);

  const MOCK_FALLBACK: Record<string, { standings: any[]; fixtures: any[] }> = {
    football: {
      standings: [
        { id: '1', team_name: 'Liverpool', matches_played: 28, wins: 20, draws: 7, losses: 1, points: 67, goals_for: 64, goals_against: 24 },
        { id: '2', team_name: 'Arsenal', matches_played: 28, wins: 17, draws: 7, losses: 4, points: 58, goals_for: 54, goals_against: 22 },
        { id: '3', team_name: 'Nottingham Forest', matches_played: 28, wins: 14, draws: 6, losses: 8, points: 48, goals_for: 42, goals_against: 33 },
        { id: '4', team_name: 'Manchester City', matches_played: 28, wins: 14, draws: 5, losses: 9, points: 47, goals_for: 54, goals_against: 37 },
        { id: '5', team_name: 'Chelsea', matches_played: 28, wins: 13, draws: 7, losses: 8, points: 46, goals_for: 52, goals_against: 36 },
        { id: '6', team_name: 'Newcastle United', matches_played: 28, wins: 13, draws: 5, losses: 10, points: 44, goals_for: 46, goals_against: 38 },
        { id: '7', team_name: 'Aston Villa', matches_played: 28, wins: 12, draws: 6, losses: 10, points: 42, goals_for: 43, goals_against: 46 },
        { id: '8', team_name: 'Fulham', matches_played: 28, wins: 11, draws: 9, losses: 8, points: 42, goals_for: 41, goals_against: 37 },
        { id: '9', team_name: 'Brighton', matches_played: 28, wins: 10, draws: 10, losses: 8, points: 40, goals_for: 44, goals_against: 42 },
        { id: '10', team_name: 'Bournemouth', matches_played: 28, wins: 11, draws: 7, losses: 10, points: 40, goals_for: 43, goals_against: 36 },
      ],
      fixtures: [
        { id: 'f1', sport: 'pl', home_team: 'Liverpool', away_team: 'Arsenal', status: 'Scheduled' }
      ]
    },
    nba: {
      standings: [
        { id: '1', team_name: 'Boston Celtics', wins: 20, losses: 5, win_pct: 0.800, pts_per_game: 120.5, opp_pts_per_game: 110.2 },
        { id: '2', team_name: 'Milwaukee Bucks', wins: 18, losses: 7, win_pct: 0.720, pts_per_game: 118.4, opp_pts_per_game: 112.5 },
        { id: '3', team_name: 'Denver Nuggets', wins: 17, losses: 8, win_pct: 0.680, pts_per_game: 115.2, opp_pts_per_game: 108.9 },
        { id: '4', team_name: 'Los Angeles Lakers', wins: 14, losses: 11, win_pct: 0.560, pts_per_game: 113.1, opp_pts_per_game: 114.2 },
      ],
      fixtures: [
        { id: 'f2', sport: 'nba', home_team: 'Denver Nuggets', away_team: 'Los Angeles Lakers', status: 'Scheduled' }
      ]
    },
    nfl: {
      standings: [
        { id: '1', team_name: 'Kansas City Chiefs', wins: 11, losses: 4, ties: 0, points_for: 360, points_against: 280 },
        { id: '2', team_name: 'San Francisco 49ers', wins: 12, losses: 3, ties: 0, points_for: 420, points_against: 250 },
        { id: '3', team_name: 'Baltimore Ravens', wins: 13, losses: 2, ties: 0, points_for: 410, points_against: 240 },
        { id: '4', team_name: 'Philadelphia Eagles', wins: 10, losses: 5, ties: 0, points_for: 380, points_against: 320 },
      ],
      fixtures: [
        { id: 'f3', sport: 'nfl', home_team: 'San Francisco 49ers', away_team: 'Kansas City Chiefs', status: 'Scheduled' }
      ]
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const fetchData = async () => {
      setIsLoading(true);
      const fallback = MOCK_FALLBACK[activeTab] || MOCK_FALLBACK.football;

      try {
        let endpoint = '';
        if (activeTab === 'football') endpoint = '/api/standings/pl';
        else if (activeTab === 'nba') endpoint = '/api/standings/nba';
        else if (activeTab === 'nfl') endpoint = '/api/standings/nfl';
          
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setTableData(data);
            } else {
              setTableData(fallback.standings);
            }
          } else {
            setTableData(fallback.standings);
          }
        } catch {
          setTableData(fallback.standings);
        }

        try {
          const chartRes = await fetch(`/api/performance/${activeTab}`);
          if (chartRes.ok) {
            const cData = await chartRes.json();
            setChartData(cData);
          }
        } catch {
          // Chart will display placeholder/fallback
        }

        const sportParam = activeTab === 'football' ? 'pl' : activeTab;
        try {
          const fixturesRes = await fetch(`/api/fixtures/${sportParam}`);
          if (fixturesRes.ok) {
            const fData = await fixturesRes.json();
            const scheduled = Array.isArray(fData) ? fData.filter((f: any) => f.status === 'Scheduled') : [];
            if (scheduled.length > 0) {
              setFixturesData(scheduled);
            } else {
              setFixturesData(fallback.fixtures);
            }
          } else {
            setFixturesData(fallback.fixtures);
          }
        } catch {
          setFixturesData(fallback.fixtures);
        }
      } catch (error) {
        console.warn("Failed to fetch data, using mock data:", error);
        setTableData(fallback.standings);
        setFixturesData(fallback.fixtures);
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
  const upcomingMatch = fixturesData.length > 0 ? fixturesData[0] : null;

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

          {/* Matchup Analysis Bento */}
          <div className="md:col-span-6 glass-card rounded-3xl p-6 md:p-10 min-h-[400px] flex flex-col">
             <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold tracking-tight text-white uppercase">Featured Matchup</h2>
            </div>
            <div className="flex-1 w-full relative">
              {upcomingMatch ? (
                <MatchupAnalysis
                  homeTeam={upcomingMatch.home_team}
                  awayTeam={upcomingMatch.away_team}
                  sport={activeTab}
                  themeColor={themeColor}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 uppercase tracking-widest text-sm">
                  {isLoading ? 'Loading...' : 'No upcoming fixtures'}
                </div>
              )}
            </div>
          </div>

          {/* Tactics Bento */}
          <div className="md:col-span-6 glass-card rounded-3xl p-6 md:p-10 min-h-[400px] flex flex-col">
            <div className="flex-1 w-full relative">
              {upcomingMatch ? (
                <TacticsBoard
                  sport={activeTab}
                  homeTeam={upcomingMatch.home_team}
                  awayTeam={upcomingMatch.away_team}
                  themeColor={themeColor}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 uppercase tracking-widest text-sm">
                  {isLoading ? 'Loading...' : 'No upcoming fixtures'}
                </div>
              )}
            </div>
          </div>

          {/* Player Comparison Bento */}
          <div className="md:col-span-6 glass-card rounded-3xl p-6 md:p-10 min-h-[400px] flex flex-col">
            <div className="flex-1 w-full relative">
              <PlayerComparison
                sport={activeTab}
                themeColor={themeColor}
              />
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
