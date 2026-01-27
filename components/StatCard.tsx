import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'normal' | 'warning' | 'critical';
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  status = 'normal',
  description 
}) => {
  const getColors = () => {
    switch (status) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-white text-slate-700 border-slate-200';
    }
  };

  const getIconColors = () => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <div className={`p-6 rounded-xl border shadow-sm transition-all duration-300 ${getColors()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium opacity-80 uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${getIconColors()}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium opacity-70">{unit}</span>}
      </div>
      {description && (
        <p className="mt-2 text-xs opacity-70">{description}</p>
      )}
    </div>
  );
};

export default StatCard;