import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, CheckSquare, Square, MessageSquare, Clock } from 'lucide-react';

export default function TaskBreakdownWidget({ activities = [], onOpenTasks }) {
  const [subtasks, setSubtasks] = useState([
    { id: 's1', title: 'Research & Preparation', time: '2h 15m', completed: true },
    { id: 's2', title: 'Logo & Identity Guidelines', time: '6h 45m', completed: true },
    { id: 's3', title: 'Application Mockups', time: '40m', completed: false },
  ]);

  const toggleSubtask = (id) => {
    setSubtasks(prev =>
      prev.map(st => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  return (
    <div className="bento-card p-6 flex flex-col justify-between h-full bg-white dark:bg-[#121620]">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Tasks
        </h2>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            aria-label="Previous task"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            aria-label="Next task"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Project Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileText size={16} />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            New BrandBook
          </span>
        </div>

        {/* Progress Bar & Time */}
        <div className="flex items-center gap-2.5">
          <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
            9h 40m
          </span>
        </div>
      </div>

      {/* Nested Subtasks Hierarchy Tree */}
      <div className="space-y-3 relative pl-3 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-px before:bg-slate-200 dark:before:bg-slate-700/60 mb-4">
        {subtasks.map((st) => (
          <div
            key={st.id}
            onClick={() => toggleSubtask(st.id)}
            className="flex items-center justify-between pl-4 relative group cursor-pointer"
          >
            {/* Tree Branch line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-px bg-slate-200 dark:bg-slate-700/60" />

            {/* Checkbox + Title */}
            <div className="flex items-center gap-2">
              {st.completed ? (
                <CheckSquare size={16} className="text-slate-700 dark:text-slate-300 fill-slate-700 dark:fill-slate-300 text-white" />
              ) : (
                <Square size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
              )}
              <span
                className={`text-xs font-medium transition-colors ${
                  st.completed
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {st.title}
              </span>
            </div>

            {/* Time logged */}
            <span className="text-[11px] font-medium text-slate-400 font-mono">
              {st.time}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800 my-2" />

      {/* Footer: Date Range + Comments + Avatars */}
      <div className="flex items-center justify-between pt-1">
        {/* Left: Date + Comments */}
        <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Clock size={13} />
            <span>Nov 24 – Dec 15</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={13} />
            <span>8</span>
          </div>
        </div>

        {/* Right: Assignee Avatars */}
        <div className="flex items-center -space-x-2">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
            alt="Assignee 1"
            className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
            alt="Assignee 2"
            className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover"
          />
        </div>
      </div>
    </div>
  );
}
