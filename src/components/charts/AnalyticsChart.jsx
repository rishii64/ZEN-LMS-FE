import React from 'react';

export function BarChartCard({ title, items = [], valueKey = 'value', labelKey = 'label', emptyLabel = 'No data yet' }) {
  const maxVal = Math.max(1, ...items.map((i) => Number(i[valueKey]) || 0));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const val = Number(item[valueKey]) || 0;
            const pct = Math.round((val / maxVal) * 100);
            return (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{item[labelKey]}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{val}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: 'var(--brand-primary, #2563eb)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
