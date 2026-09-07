import React from 'react';
import type { StatusTone } from '../../types/ppe';
const toneClasses: Record<StatusTone, string> = {
  success: 'bg-ok-50 text-ok-700 ring-ok-100',
  warning: 'bg-warn-50 text-warn-700 ring-warn-100',
  danger: 'bg-safety-50 text-safety-700 ring-safety-100',
  neutral: 'bg-slate-100 text-ink-muted ring-slate-200'
};
const dotClasses: Record<StatusTone, string> = {
  success: 'bg-ok-600',
  warning: 'bg-warn-600',
  danger: 'bg-safety-600',
  neutral: 'bg-slate-400'
};
interface StatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
  withDot?: boolean;
}
export function StatusBadge({
  tone,
  children,
  withDot = true
}: StatusBadgeProps) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[tone]}`}>
      {withDot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} aria-hidden="true" />}
      {children}
    </span>;
}