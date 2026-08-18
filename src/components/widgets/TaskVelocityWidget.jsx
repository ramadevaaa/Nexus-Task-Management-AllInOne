import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function TaskVelocityWidget({ activities = [] }) {
  const [filter, setFilter] = useState('Weekly');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Equalizer columns data (Heights out of 15 max)
  const daysData = [
    { day: 'Mon', activeBlocks: 13, maxBlocks: 15, isCyan: true },
    { day: 'Tue', activeBlocks: 10, maxBlocks: 15, isCyan: true },
    { day: 'Wed', activeBlocks: 7, maxBlocks: 15, isCyan: true },
    { day: 'Thu', activeBlocks: 5, maxBlocks: 15, isCyan: false },
    { day: 'Fri', activeBlocks: 4, maxBlocks: 15, isCyan: false },
  ];

  // Avatars list
  const avatars = [
    { id: 1, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', name: 'Sarah' },
    { id: 2, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', name: 'Alex' },
    { id: 3, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', name: 'Emma' },
    { id: 4, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', name: 'David' },
    { id: 5, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face', name: 'Lisa' },
  ];

  const totalTasks = activities.length > 0 ? activities.length + 120 : 146;

  return (
    <div className="bento-card-dark p-6 flex flex-col justify-between h-full bg-[#080a0e] text-white">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-slate-300">
          Number of tasks
        </span>

        {/* Dropdown Filter */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-slate-300 transition-all border border-white/5"
          >
            <span>{filter}</span>
            <ChevronDown size={12} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-28 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-30">
              {['Daily', 'Weekly', 'Monthly'].map(opt => (
                <button
                  key={opt}
                  onClick={() => { setFilter(opt); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hero Stat: 146 +14 */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold tracking-tight text-white font-sans">
          {totalTasks}
        </span>
        <span className="text-xs font-bold text-emerald-400">
          +14
        </span>
      </div>

      {/* Equalizer Chart Box */}
      <div className="rounded-2xl bg-[#11141c] p-4 border border-white/[0.04] mb-4">
        <div className="flex items-end justify-between h-36 gap-2">
          {/* Y-axis Labels */}
          <div className="flex flex-col justify-between h-full text-[10px] text-slate-500 font-mono pr-1 select-none">
            <span>15</span>
            <span>10</span>
            <span>5</span>
            <span>0</span>
          </div>

          {/* Equalizer Columns */}
          <div className="flex-1 flex items-end justify-around h-full gap-2 pl-2">
            {daysData.map((col, idx) => {
              return (
                <div key={col.day} className="flex flex-col-reverse gap-[3px] w-6 h-full justify-start items-center">
                  {Array.from({ length: 14 }).map((_, blockIdx) => {
                    const isActive = blockIdx < col.activeBlocks;
                    return (
                      <div
                        key={blockIdx}
                        className={`w-full h-1.5 rounded-xs transition-all duration-300 ${
                          isActive
                            ? col.isCyan
                              ? 'bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                              : 'bg-slate-600'
                            : 'bg-transparent'
                        }`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer: Avatar Stack & Carousel Dots */}
      <div className="flex flex-col items-center gap-3">
        {/* Avatars */}
        <div className="flex items-center -space-x-2">
          {avatars.map((av) => (
            <img
              key={av.id}
              src={av.img}
              alt={av.name}
              className="w-8 h-8 rounded-full border-2 border-[#080a0e] object-cover ring-1 ring-white/10 hover:scale-110 hover:z-10 transition-transform cursor-pointer"
            />
          ))}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-1.5 rounded-full bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/25" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  );
}
