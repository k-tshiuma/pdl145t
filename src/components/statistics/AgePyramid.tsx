import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AgePyramid({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucune donnée disponible</div>;
  }

  // Custom tooltip to show absolute values (removing the negative sign for males)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-pdl-border p-3 shadow-lg rounded text-sm">
          <p className="font-bold mb-2">Âge {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name} :</span>
              <span className="font-semibold">
                {entry.name === 'Hommes' ? Math.abs(entry.payload.maleRaw) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
        <XAxis 
          type="number" 
          tickFormatter={(value) => Math.abs(value).toString()} 
          tick={{ fontSize: 11, fill: '#475569' }} 
        />
        <YAxis 
          dataKey="ageGroup" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fontWeight: 'bold' }} 
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
        <Legend verticalAlign="top" height={36} iconType="square" />
        <Bar dataKey="male" name="Hommes" fill="#0B3056" stackId="stack" />
        <Bar dataKey="female" name="Femmes" fill="#D97706" stackId="stack" />
      </BarChart>
    </ResponsiveContainer>
  );
}
