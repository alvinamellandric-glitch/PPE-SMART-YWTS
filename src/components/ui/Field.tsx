import React from 'react';
export const inputClasses = 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 transition-colors duration-150 ease-smooth hover:border-slate-300 focus:border-safety-600 focus:outline-none focus:ring-2 focus:ring-safety-100';
interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}
export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
  className = ''
}: FieldProps) {
  return <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline gap-1 text-sm font-semibold text-ink-soft">
        {label}
        {required && <span className="text-safety-600" aria-hidden="true">
            *
          </span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-subtle">{hint}</p>}
    </div>;
}