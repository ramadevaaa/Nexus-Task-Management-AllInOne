import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MonthlyGoalProgressWidget({ progress = 82 }) {
  const [goalOffset, setGoalOffset] = useState(0);

  const months = ['Current month goals', 'Last month goals', 'Q3 Target goals'];
  const currentTitle = months[Math.abs(goalOffset) % months.length];

  return (
    <div className="bento-card p-6 w-full bg-white dark:bg-[#121620]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Monthly progress towards your goals
          </h2>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            {currentTitle}
          </span>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setGoalOffset(prev => prev - 1)}
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setGoalOffset(prev => prev + 1)}
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Candy-Stripe Progress Bar Row */}
      <div className="flex items-center gap-4">
        {/* Track */}
        <div className="flex-1 h-8 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 overflow-hidden shadow-inner flex items-center">
          {/* Animated Cyan Striped Bar */}
          <div
            style={{ width: `${progress}%` }}
            className="h-full rounded-xl striped-cyan transition-all duration-700 shadow-md"
            title={`${progress}% completed`}
          />
        </div>

        {/* Percentage Label */}
        <span className="text-lg font-bold text-slate-900 dark:text-white font-sans shrink-0 w-12 text-right">
          {progress}%
        </span>
      </div>
    </div>
  );
}
