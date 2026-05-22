import type { ReactNode } from 'react';

export default function SectionHeading({
  title,
  subtitle,
  action,
  centered = false,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  centered?: boolean;
}) {
  if (centered) {
    return (
      <div className="mb-4 text-center">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
