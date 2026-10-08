import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MatchupAnalysisProps {
  homeTeam: string;
  awayTeam: string;
  sport: string;
  themeColor: string;
}

export function MatchupAnalysis({ homeTeam, awayTeam, sport, themeColor }: MatchupAnalysisProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch specific head-to-head stats.
    // We will generate a comparison radar chart based on the sport.
    setIsLoading(true);
    
    let comparisonData: any[] = [];
    if (sport === 'football') {
      comparisonData = [
        { stat: 'Attack (xG)', [homeTeam]: 2.1, [awayTeam]: 1.8, fullMark: 3 },
        { stat: 'Defense (xGA)', [homeTeam]: 1.2, [awayTeam]: 1.5, fullMark: 3 },
        { stat: 'Possession %', [homeTeam]: 55, [awayTeam]: 45, fullMark: 100 },
        { stat: 'Pass Accuracy', [homeTeam]: 88, [awayTeam]: 82, fullMark: 100 },
        { stat: 'Shots/Game', [homeTeam]: 15, [awayTeam]: 12, fullMark: 20 },
      ];
    } else if (sport === 'nba') {
      comparisonData = [
        { stat: 'Offensive Rtg', [homeTeam]: 118, [awayTeam]: 115, fullMark: 130 },
        { stat: 'Defensive Rtg', [homeTeam]: 110, [awayTeam]: 114, fullMark: 130 },
        { stat: 'Pace', [homeTeam]: 102, [awayTeam]: 98, fullMark: 110 },
        { stat: 'Reb %', [homeTeam]: 52, [awayTeam]: 48, fullMark: 100 },
        { stat: 'Ast %', [homeTeam]: 65, [awayTeam]: 60, fullMark: 100 },
      ];
    } else {
      comparisonData = [
        { stat: 'Pass Yds/G', [homeTeam]: 280, [awayTeam]: 240, fullMark: 350 },
        { stat: 'Rush Yds/G', [homeTeam]: 130, [awayTeam]: 150, fullMark: 200 },
        { stat: '3rd Down %', [homeTeam]: 45, [awayTeam]: 40, fullMark: 60 },
        { stat: 'Red Zone %', [homeTeam]: 65, [awayTeam]: 55, fullMark: 100 },
        { stat: 'Turnovers', [homeTeam]: 1.1, [awayTeam]: 1.8, fullMark: 3 },
      ];
    }

    // Simulate API delay
    setTimeout(() => {
      setData(comparisonData);
      setIsLoading(false);
    }, 500);

  }, [homeTeam, awayTeam, sport]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-center mb-4">
        <div className="text-xl font-bold uppercase text-white flex justify-center items-center gap-4">
          <span className="text-[#f0f0f0] truncate">{homeTeam}</span>
          <span className="text-white/40 text-sm">VS</span>
          <span style={{ color: themeColor }} className="truncate">{awayTeam}</span>
        </div>
        <p className="text-xs text-white/50 tracking-widest uppercase mt-1">Head-to-Head Projection</p>
      </div>

      <div className="flex-1 min-h-[250px] w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="stat" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, textAnchor: 'middle' }} />
            
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            
            <Radar
              name={homeTeam}
              dataKey={homeTeam}
              stroke="#f0f0f0"
              fill="#f0f0f0"
              fillOpacity={0.3}
            />
            
            <Radar
              name={awayTeam}
              dataKey={awayTeam}
              stroke={themeColor}
              fill={themeColor}
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
