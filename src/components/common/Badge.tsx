import React from 'react';
import { ApplicationStage } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'slate' | 'red' | 'purple' | 'indigo';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-semibold' : 'px-3 py-1 text-sm font-semibold';
  
  const variantMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${variantMap[variant]}`}>
      {children}
    </span>
  );
};

export const ApplicationStatusBadge: React.FC<{ status: ApplicationStage }> = ({ status }) => {
  switch (status) {
    case 'Applied':
      return <Badge variant="slate">Applied</Badge>;
    case 'Shortlisted':
      return <Badge variant="blue">Shortlisted</Badge>;
    case 'Assessment':
      return <Badge variant="indigo">Assessment</Badge>;
    case 'Technical Interview':
      return <Badge variant="purple">Tech Interview</Badge>;
    case 'HR Interview':
      return <Badge variant="amber">HR Interview</Badge>;
    case 'Selected':
      return <Badge variant="emerald">🎉 Selected</Badge>;
    case 'Rejected':
      return <Badge variant="red">Rejected</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};
