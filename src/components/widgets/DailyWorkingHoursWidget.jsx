import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Flame } from 'lucide-react';

export default function DailyWorkingHoursWidget({ timer, onOpenTimerModal }) {
  const [dayOffset, setDayOffset] = useState(0);

  const days = ['Today', 'Yesterday', '2 days ago', '3 days ago'];
  const currentDayLabel = days[Math.abs(dayOffset) % days.length];

  // Dynamic calculations from live timer if active
  const isTimerRunning = Boolean(timer?.isActive);
  const timerFormatted = typeof timer?.formatTime === 'function' ? timer.formatTime() : (timer?.formatTime || '25:00');
  const timerMode = timer?.mode || 'focus';

  const activeHours = isTimerRunning ? `${timerFormatted} (${timerMode})` : '6h 17m';
  const pauseHours = '2h 10m';
  const totalHours = isTimerRunning ? timerFormatted : '8 h 27m';
  const activePercent = isTimerRunning ? (timer?.progressPct || 74) : 74;

  return (
    <div className="bento-card p-6 flex flex-col justify-between h-full bg-white dark:bg-[#121620]">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Daily working hours
          </h2>
          <span className="text-[10px] font-bold text-slate-400">
            {currentDayLabel}
          </span>
        </div>

        {/* Navigation Arrows & Live Controls */}
        <div className="flex items-center gap-1.5">
          {timer?.toggleTimer && (
            <button
              onClick={(e) => { e.stopPropagation(); timer.toggleTimer(); }}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-all shadow-sm active:scale-90 ${
                isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
              title={isTimerRunning ? 'Pause Timer' : 'Start Focus Timer'}
            >
              {isTimerRunning ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
            </button>
          )}

          {timer?.resetTimer && (
            <button
              onClick={(e) => { e.stopPropagation(); timer.resetTimer(); }}
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all active:scale-90"
              title="Reset Timer"
            >
              <RotateCcw size={11} />
            </button>
          )}

          <button
            onClick={() => setDayOffset(prev => prev - 1)}
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:hover:text-white transition-all active:scale-95 ml-1"
            aria-label="Previous day"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setDayOffset(prev => prev + 1)}
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:hover:text-white transition-all active:scale-95"
            aria-label="Next day"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Hero Stat: Hourglass + Big Duration */}
      <div className="flex items-center gap-3 my-auto py-1">
        <span className={`text-3xl filter drop-shadow-sm select-none ${isTimerRunning ? 'animate-bounce' : ''}`}>
          ⏳
        </span>
        <div className="flex flex-col">
          <span className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            {totalHours}
          </span>
          {isTimerRunning && (
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
              ● Live Focus Session
            </span>
          )}
        </div>
      </div>

      <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800 my-3" />

      {/* Split Bars: Active Time vs Pause Time */}
      <div>
        {/* Labels */}
        <div className="flex justify-between items-end mb-2.5">
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
              Active time
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {activeHours}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
              Pause time
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {pauseHours}
            </span>
          </div>
        </div>

        {/* Meters */}
        <div className="flex items-center gap-1.5 h-11 w-full">
          {/* Active Time (Striped Emerald Bar) */}
          <div
            style={{ width: `${Math.max(15, activePercent)}%` }}
            className={`h-full rounded-2xl striped-emerald shadow-sm transition-all duration-500 hover:brightness-105 relative group cursor-pointer ${
              isTimerRunning ? 'brightness-110 shadow-emerald-500/20' : ''
            }`}
            title={`Active Work: ${activeHours}`}
          />

          {/* Pause Time (Solid Orange Bar) */}
          <div
            style={{ width: `${Math.max(15, 100 - activePercent)}%` }}
            className="h-full rounded-2xl bg-[#ea580c] shadow-sm transition-all duration-500 hover:brightness-105 relative group cursor-pointer"
            title={`Pause/Break: ${pauseHours}`}
          />
        </div>
      </div>
    </div>
  );
}
