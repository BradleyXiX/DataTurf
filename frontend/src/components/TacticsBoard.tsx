import { useState, useEffect } from 'react';

interface TacticsBoardProps {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  themeColor: string;
}

export function TacticsBoard({ sport, homeTeam, awayTeam, themeColor }: TacticsBoardProps) {
  const [homeFormation, setHomeFormation] = useState('');
  const [awayFormation, setAwayFormation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchLineups = async () => {
      try {
        const sportParam = sport === 'football' ? 'pl' : sport;
        // In a real app we would pass these properly encoded
        const res = await fetch(`/api/predicted-lineups/${sportParam}/${encodeURIComponent(homeTeam)}/${encodeURIComponent(awayTeam)}`);
        if (res.ok) {
          const data = await res.json();
          const home = data.find((d: any) => d.team_name === homeTeam);
          const away = data.find((d: any) => d.team_name === awayTeam);
          if (home) setHomeFormation(home.formation);
          if (away) setAwayFormation(away.formation);
        }
      } catch (e) {
        console.error("Failed to fetch lineups", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLineups();
  }, [homeTeam, awayTeam, sport]);

  if (sport !== 'football') {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center flex-col gap-4">
        <p className="text-white/40 uppercase tracking-widest text-sm">Tactics board available for Soccer only.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-widest">Predicted Tactics</h3>
      </div>

      <div className="flex-1 w-full flex flex-col md:flex-row gap-6 relative justify-center items-center">
        {/* Mock Pitch */}
        <div className="w-full max-w-sm aspect-[4/3] rounded-lg border-2 border-white/10 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(20,20,20,0.5) 100%)' }}>
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/10"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full border border-white/10 -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Home Formation */}
            <div className="absolute top-4 left-4 right-4 text-center">
              <span className="px-3 py-1 bg-black/50 backdrop-blur text-xs font-bold text-white rounded-full border border-white/5 shadow-lg">
                {homeTeam}: {homeFormation || '4-3-3'}
              </span>
            </div>
            
            {/* Away Formation */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <span className="px-3 py-1 bg-black/50 backdrop-blur text-xs font-bold text-white rounded-full border border-white/5 shadow-lg">
                {awayTeam}: {awayFormation || '4-2-3-1'}
              </span>
            </div>

            {/* Simulated Player Nodes */}
            <div className="absolute top-[25%] left-[50%] w-2 h-2 rounded-full shadow-[0_0_10px_2px]" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px 2px ${themeColor}50`, transform: 'translate(-50%, -50%)' }}></div>
            <div className="absolute top-[25%] left-[25%] w-2 h-2 rounded-full shadow-[0_0_10px_2px]" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px 2px ${themeColor}50`, transform: 'translate(-50%, -50%)' }}></div>
            <div className="absolute top-[25%] left-[75%] w-2 h-2 rounded-full shadow-[0_0_10px_2px]" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px 2px ${themeColor}50`, transform: 'translate(-50%, -50%)' }}></div>

            <div className="absolute bottom-[25%] left-[50%] w-2 h-2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]" style={{ transform: 'translate(-50%, -50%)' }}></div>
            <div className="absolute bottom-[35%] left-[30%] w-2 h-2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]" style={{ transform: 'translate(-50%, -50%)' }}></div>
            <div className="absolute bottom-[35%] left-[70%] w-2 h-2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]" style={{ transform: 'translate(-50%, -50%)' }}></div>
        </div>
      </div>
    </div>
  );
}
