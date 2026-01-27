import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { SensorData } from '../types';

interface ChartsProps {
  data: SensorData[];
  threshold: number;
}

export const ConcentrationChart: React.FC<ChartsProps> = ({ data }) => {
  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
        Cu2+ 浓度 (mg/L)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="timeLabel" 
            stroke="#64748b" 
            fontSize={12} 
            tickMargin={10} 
            padding={{ left: 10, right: 10 }}
          />
          <YAxis stroke="#64748b" fontSize={12} domain={[0, 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Line 
            type="monotone" 
            dataKey="inletConcentration" 
            name="入口 (未处理)" 
            stroke="#6366f1" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="outletConcentration" 
            name="出口 (已处理)" 
            stroke="#10b981" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SaturationChart: React.FC<ChartsProps> = ({ data, threshold }) => {
  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
        MOF 饱和度 (%)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSaturation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="timeLabel" 
            stroke="#64748b" 
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            domain={[0, 100]} 
            unit="%"
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <ReferenceLine y={threshold * 100} stroke="red" strokeDasharray="3 3" label={{ value: '预警阈值', fill: 'red', fontSize: 10 }} />
          <Area 
            type="monotone" 
            dataKey="saturation" 
            stroke="#f97316" 
            fillOpacity={1} 
            fill="url(#colorSaturation)" 
            name="饱和度"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};