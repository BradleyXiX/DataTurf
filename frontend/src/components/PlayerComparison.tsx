import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PlayerComparisonProps {
  sport: string;
  themeColor: string;
}

export function PlayerComparison({ sport, themeColor }: PlayerComparisonProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // In a full implementation, we'd fetch this from our DB based on the matchup.
    // For now, we use dynamic placeholders for the UI.
    setTimeout(() => {
      if (sport === 'football') {
        setData([
          { metric: 'Goals', player1: 15, player2: 12 },
          { metric: 'Assists', player1: 8, player2: 10 },
          { metric: 'xG', player1: 14.2, player2: 11.5 },
          { metric: 'xA', player1: 7.1, player2: 9.8 },
          { metric: 'Shots', player1: 45, player2: 38 }
        ]);
      } else if (sport === 'nba') {
        setData([
          { metric: 'PPG', player1: 28.5, player2: 25.1 },
          { metric: 'RPG', player1: 8.4, player2: 11.2 },
          { metric: 'APG', player1: 6.2, player2: 5.5 },
          { metric: 'SPG', player1: 1.5, player2: 0.8 },
          { metric: 'TS%', player1: 62.1, player2: 58.5 }
        ]);
      } else {
        setData([
          { metric: 'Pass Yds', player1: 350, player2: 280 },
          { metric: 'Rush Yds', player1: 25, player2: 50 },
          { metric: 'TDs', player1: 3, player2: 2 },
          { metric: 'INTs', player1: 0, player2: 1 },
          { metric: 'QBR', player1: 110, player2: 95 }
        ]);
      }
      setIsLoading(false);
    }, 500);
  }, [sport]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-widest">Star Player Head-to-Head</h3>
        <div className="flex justify-center items-center gap-4 mt-2">
          <span className="text-sm font-semibold" style={{ color: themeColor }}>Player A</span>
          <span className="text-xs text-white/40">VS</span>
          <span className="text-sm font-semibold text-[#f0f0f0]">Player B</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px] relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="metric" type="category" axisLine={false} tickLine={false} tick={{ fill: '#fff', fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
            />
            <Bar dataKey="player1" name="Player A" fill={themeColor} radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="player2" name="Player B" fill="#f0f0f0" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
