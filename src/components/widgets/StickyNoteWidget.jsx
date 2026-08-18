import React, { useState, useEffect } from 'react';
import { Pencil, MoreHorizontal, Play, Pause, CheckCircle2, Circle } from 'lucide-react';

export default function StickyNoteWidget({ onEditNote, onOpenVault }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [items, setItems] = useState([
    { id: 1, text: 'Logo usage rules', completed: true },
    { id: 2, text: 'Updated color palette with HEX, RGB, CMYK codes', completed: false },
  ]);

  const toggleItem = (id) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const speeds = ['1x', '1.5x', '2x'];
  const cycleSpeed = (e) => {
    e.stopPropagation();
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  // Waveform static heights (mimicking audio waves)
  const waveBars = [
    6, 12, 18, 24, 14, 8, 16, 26, 20, 15, 28, 18, 12, 22, 16, 10, 20, 14, 8, 16, 22, 12, 6, 10, 18
  ];

  return (
    <div className="bento-card-yellow p-6 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-extrabold tracking-wider text-[#786118] uppercase">
          BRANDBOOK NOTE
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onEditNote}
            className="w-7 h-7 rounded-full bg-[#f3c83e] hover:bg-[#ebbe32] flex items-center justify-center text-[#594407] transition-all"
            aria-label="Edit Note"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onOpenVault}
            className="w-7 h-7 rounded-full bg-[#f3c83e] hover:bg-[#ebbe32] flex items-center justify-center text-[#594407] transition-all"
            aria-label="More options"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Note Description */}
      <p className="text-xs font-semibold text-[#483707] leading-relaxed mb-4">
        Start working on the new BrandBook layout. Make it clean, modern, and easy to navigate. Remember to include:
      </p>

      {/* Audio Waveform Player Widget */}
      <div className="rounded-full bg-white/95 backdrop-blur-md px-2 py-1.5 shadow-sm flex items-center justify-between gap-2.5 mb-4 border border-white/40">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
        </button>

        {/* Animated Waveform */}
        <div className="flex-1 flex items-center justify-center gap-[2.5px] h-6 overflow-hidden">
          {waveBars.map((height, i) => {
            const dynamicHeight = isPlaying ? Math.max(4, (height + (i % 3) * 4) % 26) : height;
            return (
              <div
                key={i}
                style={{ height: `${dynamicHeight}px` }}
                className={`w-[2.5px] rounded-full transition-all duration-200 ${
                  i < 10 ? 'bg-slate-900' : 'bg-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Timer */}
        <span className="text-xs font-bold text-slate-800 font-mono shrink-0">
          6:12
        </span>

        {/* Speed Toggle */}
        <button
          onClick={cycleSpeed}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors"
        >
          {playbackSpeed}
        </button>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5 mb-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className="flex items-start gap-2 cursor-pointer group"
          >
            <div className="mt-0.5 shrink-0 text-[#483707]">
              {item.completed ? (
                <CheckCircle2 size={16} className="text-[#362a04] fill-[#fbd65b]" />
              ) : (
                <Circle size={16} className="text-[#786118] group-hover:text-[#362a04]" />
              )}
            </div>
            <span
              className={`text-xs font-semibold text-[#483707] leading-snug transition-all ${
                item.completed ? 'line-through opacity-80' : ''
              }`}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Timestamp */}
      <div className="text-right">
        <span className="text-[10px] font-bold text-[#8a7224]">
          Today, 2:35 PM
        </span>
      </div>
    </div>
  );
}
