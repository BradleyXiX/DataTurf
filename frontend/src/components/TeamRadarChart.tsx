'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TeamRadarChartProps {
  data: any[];
  isLoading: boolean;
  color?: string;
}

export function TeamRadarChart({ data, isLoading, color = "#f97316" }: TeamRadarChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center text-white/40">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="stat" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(10,10,10,0.8)', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              backdropFilter: 'blur(8px)',
              color: '#fff'
            }}
            itemStyle={{ color: color, fontWeight: 'bold' }}
          />
          <Radar name="Team Performance" dataKey="val" stroke={color} fill={color} fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
