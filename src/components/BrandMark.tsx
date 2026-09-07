import React from 'react';
import { HardHatIcon, ShieldCheckIcon } from 'lucide-react';
interface BrandMarkProps {
  size?: 'sm' | 'md';
  inverted?: boolean;
}
export function BrandMark({
  size = 'md',
  inverted = false
}: BrandMarkProps) {
  const box = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const icon = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  return <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <div className={`grid ${box} place-items-center rounded-xl bg-safety-600 text-white shadow-card`}>
          <HardHatIcon className={icon} aria-hidden="true" />
        </div>
        <span className={`absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full ring-2 ${inverted ? 'bg-white text-safety-600 ring-ink' : 'bg-ink text-white ring-white'}`} aria-hidden="true">
          <ShieldCheckIcon className="h-3 w-3" />
        </span>
      </div>
      <div className="leading-tight">
        <p className={`text-base font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-ink'}`}>
          PPE SMART
        </p>
        <p className={`text-[11px] font-medium ${inverted ? 'text-slate-400' : 'text-ink-subtle'}`}>
          K3 · Manajemen APD
        </p>
      </div>
    </div>;
}