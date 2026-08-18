import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function TimeAnalysisWidget() {
  const [selectedDay, setSelectedDay] = useState('Wed');
  const [filter, setFilter] = useState('Weekly');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const dayStats = {
    Mon: { active: '7h 10m', pause: '1h 45m', x: 40, activeY: 65, pauseY: 100 },
    Tue: { active: '8h 20m', pause: '2h 15m', x: 100, activeY: 50, pauseY: 92 },
    Wed: { active: '26h active time', pause: '10h 15m pause time', x: 160, activeY: 42, pauseY: 88 },
    Thu: { active: '7h 45m', pause: '2h 00m', x: 220, activeY: 55, pauseY: 96 },
    Fri: { active: '6h 15m', pause: '1h 30m', x: 280, activeY: 60, pauseY: 105 },
  };

  const current = dayStats[selectedDay] || dayStats['Wed'];

  return (
    <div className="bento-card p-6 flex flex-col justify-between h-full bg-white dark:bg-[#121620]">
      {/* Top Header */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Working time analysis
        </h2>

        {/* Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <span>{filter}</span>
            <ChevronDown size={12} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-28 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30">
              {['Daily', 'Weekly', 'Monthly'].map(opt => (
                <button
                  key={opt}
                  onClick={() => { setFilter(opt); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hero Stat: 36h 15m */}
      <div className="mb-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
          36h 15m
        </span>
      </div>

      {/* Interactive Dual Wave SVG Chart */}
      <div className="relative w-full h-32 my-1">
        {/* Floating Tooltip above node */}
        <div
          className="absolute -top-1 z-20 pointer-events-none transition-all duration-300"
          style={{ left: `${(current.x / 320) * 100}%`, transform: 'translateX(-50%)' }}
        >
          <div className="flex items-center gap-2 bg-[#090b10] text-white px-2.5 py-1 rounded-xl text-[10px] font-semibold shadow-xl whitespace-nowrap border border-white/10">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              {current.active}
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {current.pause}
            </span>
          </div>
        </div>

        <svg className="w-full h-full overflow-visible" viewBox="0 0 320 130">
          <defs>
            <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Baseline */}
          <line x1="10" y1="120" x2="310" y2="120" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />

          {/* Active Vertical Indicator Line */}
          <line
            x1={current.x}
            y1={current.activeY}
            x2={current.x}
            y2="120"
            stroke="#8b5cf6"
            strokeDasharray="2 2"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />

          {/* Purple Smooth Curve (Active Time) */}
          <path
            d="M 10 75 Q 40 45, 70 58 T 130 52 T 160 42 T 200 48 T 240 56 T 280 50 T 310 65"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Orange Smooth Curve (Pause Time) */}
          <path
            d="M 10 105 Q 40 88, 70 96 T 130 92 T 160 88 T 200 94 T 240 98 T 280 102 T 310 110"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Active Nodes */}
          <circle
            cx={current.x}
            cy={current.activeY}
            r="4.5"
            fill="#8b5cf6"
            stroke="#ffffff"
            strokeWidth="2"
            className="transition-all duration-300 shadow-md cursor-pointer"
          />
          <circle
            cx={current.x}
            cy={current.pauseY}
            r="4"
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="transition-all duration-300 shadow-md cursor-pointer"
          />
        </svg>
      </div>

      {/* Bottom Days Segmented Pill & Dots */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="w-full bg-slate-50 dark:bg-slate-800/60 p-1 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800/80">
          {days.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-1 text-xs font-semibold rounded-xl transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="w-3.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      </div>
    </div>
  );
}
