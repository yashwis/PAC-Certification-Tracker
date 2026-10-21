import React from 'react';
import { TestStatus } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, PlayCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TestStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Pass':
        return {
          textColor: 'text-emerald-700 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
          borderColor: 'border-emerald-200 dark:border-emerald-800/60',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'Fail':
        return {
          textColor: 'text-rose-700 dark:text-rose-400',
          bgColor: 'bg-rose-50 dark:bg-rose-950/40',
          borderColor: 'border-rose-200 dark:border-rose-800/60',
          icon: XCircle,
          iconColor: 'text-rose-600 dark:text-rose-400'
        };
      case 'Blocked':
        return {
          textColor: 'text-amber-800 dark:text-amber-300',
          bgColor: 'bg-amber-50 dark:bg-amber-950/40',
          borderColor: 'border-amber-200 dark:border-amber-800/60',
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400'
        };
      case 'Retest':
        return {
          textColor: 'text-indigo-700 dark:text-indigo-400',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
          borderColor: 'border-indigo-200 dark:border-indigo-800/60',
          icon: RefreshCw,
          iconColor: 'text-indigo-600 dark:text-indigo-400'
        };
      case 'In Progress':
        return {
          textColor: 'text-sky-700 dark:text-sky-400',
          bgColor: 'bg-sky-50 dark:bg-sky-950/40',
          borderColor: 'border-sky-200 dark:border-sky-800/60',
          icon: PlayCircle,
          iconColor: 'text-sky-600 dark:text-sky-400'
        };
      case 'Pending':
      default:
        return {
          textColor: 'text-slate-600 dark:text-slate-400',
          bgColor: 'bg-slate-100 dark:bg-slate-800/60',
          borderColor: 'border-slate-200 dark:border-slate-700',
          icon: Clock,
          iconColor: 'text-slate-500 dark:text-slate-400'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2'
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded border ${config.bgColor} ${config.borderColor} ${config.textColor} ${sizeClasses} whitespace-nowrap shrink-0`}
    >
      {showIcon && <IconComponent className={`${iconSizes} ${config.iconColor} shrink-0`} />}
      <span>{status}</span>
    </span>
  );
};
