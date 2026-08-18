import React, { useState } from 'react';
import { Clock, MoreHorizontal, Video, Plus } from 'lucide-react';

// Platform SVG Icons
const GoogleMeetIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path d="M12 5C6.48 5 2 9.48 2 15C2 17.54 2.95 19.86 4.54 21.64L3 27L8.52 25.56C10.23 26.48 12.18 27 14.25 27C19.77 27 24.25 22.52 24.25 17C24.25 11.48 19.77 5 14.25 5H12Z" fill="#00832d" />
    <path d="M15 12.5L20 8.5V17.5L15 13.5V16.5C15 17.05 14.55 17.5 14 17.5H5C4.45 17.5 4 17.05 4 16.5V9.5C4 8.95 4.45 8.5 5 8.5H14C14.55 8.5 15 8.95 15 9.5V12.5Z" fill="#00ac47" />
    <path d="M15 12.5L20 8.5V17.5L15 13.5V12.5Z" fill="#0066da" />
    <path d="M5 8.5H14V17.5H5V8.5Z" fill="#00ac47" />
    <path d="M14 8.5H10V17.5H14V8.5Z" fill="#00832d" />
    <path d="M14 8.5H5V12.5H14V8.5Z" fill="#ffba00" />
    <path d="M5 12.5H14V17.5H5V12.5Z" fill="#eb4132" />
  </svg>
);

const ZoomIcon = () => (
  <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
    <Video className="w-3.5 h-3.5 text-white" />
  </div>
);

const TeamsIcon = () => (
  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-[10px] text-white shadow-sm">
    T
  </div>
);

export default function WeeklyScheduleWidget({ activities = [], onAddActivity, onOpenCalendar }) {
  // Extract upcoming event activities or provide rich contextual schedule items
  const eventActivities = activities.filter(a => a.type === 'event');

  const defaultSchedule = [
    {
      id: 'm1',
      month: 'Sep',
      day: '15',
      title: 'Meeting with marketing team',
      time: '13:00 - 13:45',
      platform: 'meet',
    },
    {
      id: 'm2',
      month: 'Sep',
      day: '16',
      title: 'Meeting with marketing team',
      time: '12:00 - 12:45',
      platform: 'zoom',
    },
    {
      id: 'm3',
      month: 'Sep',
      day: '17',
      title: 'Meeting with marketing team',
      time: '10:00 - 12:00',
      platform: 'teams',
    },
    {
      id: 'm4',
      month: 'Sep',
      day: '17',
      title: 'Meeting with new client',
      time: '15:00 - 16:45',
      platform: 'meet',
    },
  ];

  const meetings = eventActivities.length > 0
    ? eventActivities.slice(0, 4).map((event, idx) => {
        const d = event.date ? new Date(event.date) : new Date();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const day = d.getDate();
        const platform = idx % 3 === 0 ? 'meet' : idx % 3 === 1 ? 'zoom' : 'teams';
        return {
          id: event.id,
          month,
          day: String(day),
          title: event.title,
          time: event.time || '13:00 - 13:45',
          platform,
        };
      })
    : defaultSchedule;

  return (
    <div className="bento-card p-6 flex flex-col justify-between h-full bg-white dark:bg-[#121620]">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-400 block mb-0.5">
            Your meetings
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Weekly schedule
          </h2>
        </div>
        <button
          onClick={onAddActivity}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Add meeting"
          aria-label="Add meeting"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Meetings List */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {meetings.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 group cursor-pointer"
            onClick={onOpenCalendar}
          >
            {/* Date Box */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-400 uppercase leading-none">
                  {item.month}
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {item.day}
                </span>
              </div>

              {/* Info */}
              <div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h4>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100/80 dark:border-sky-900/40 text-[10px] font-medium">
                  <Clock size={10} />
                  <span>{item.time}</span>
                </div>
              </div>
            </div>

            {/* Platform Icon */}
            <div className="shrink-0 pl-2">
              {item.platform === 'meet' && <GoogleMeetIcon />}
              {item.platform === 'zoom' && <ZoomIcon />}
              {item.platform === 'teams' && <TeamsIcon />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
