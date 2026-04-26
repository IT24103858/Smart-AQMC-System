/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const colorClasses = {
  primary: {
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    gradient: 'from-primary/5 to-transparent',
  },
  'blue-500': {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
    gradient: 'from-blue-500/5 to-transparent',
  },
  'indigo-500': {
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-500',
    gradient: 'from-indigo-500/5 to-transparent',
  },
  'amber-500': {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-500',
    gradient: 'from-amber-500/5 to-transparent',
  },
  'emerald-500': {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-500',
    gradient: 'from-emerald-500/5 to-transparent',
  },
};

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  period: string;
  color?: string;
  onClick?: () => void;
}

import { FC } from 'react';

const StatCard: FC<StatCardProps> = ({ icon, label, value, change, changeType, period, color = 'primary', onClick }) => {
  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-primary/20 transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      <div className={`absolute -right-6 -top-6 size-32 bg-gradient-to-br ${classes.gradient} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 opacity-60`}></div>

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className={`size-11 rounded-xl ${classes.iconBg} ${classes.iconText} flex items-center justify-center shadow-inner`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${changeType === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <span className="material-symbols-outlined text-[14px]">
              {changeType === 'positive' ? 'trending_up' : 'trending_down'}
            </span>
            {change}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
            <span className="text-[11px] font-medium text-slate-400">{period}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
