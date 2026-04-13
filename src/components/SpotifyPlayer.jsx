import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { Play, Pause, Music, Disc, Repeat } from 'lucide-react';

const PLAYLISTS = {
  Lofi: [
    { title: 'Dust - Soft Dunes', src: '/audio/lofi/SpotiDown.App - Dust - Soft Dunes.mp3', duration: '3:57' },
    { title: 'Sidewalk in Soft Light', src: '/audio/lofi/SpotiDown.App - Sidewalk in Soft Light - Dry Season.mp3', duration: '3:53' },
    { title: 'Flume', src: '/audio/lofi/SpotiDown.App - _φ______φ______φ______φ______φ______φ______φ______φ______φ______φ______φ______φ______φ______φ______φ______φ______φ______φ___ - Flume.mp3', duration: '2:18' },
  ],
  Focus: [
    { title: '40 Hz Binaural Beats', src: '/audio/focus/SpotiDown.App - 40 Hz Binaural Beats - Miracle Tones.mp3', duration: '5:24' },
    { title: 'Focus - Brainy', src: '/audio/focus/SpotiDown.App - Focus - Brainy.mp3', duration: '3:48' },
    { title: 'Genius Mode Activated', src: '/audio/focus/SpotiDown.App - Genius Mode Activated - Hz Frequency Zone.mp3', duration: '6:18' },
  ],
  Chill: [
    { title: 'Coffee with My Baby', src: '/audio/chill/SpotiDown.App - Coffee with My Baby - James Jackson Jazz Trio.mp3', duration: '4:48' },
    { title: 'Ludlow', src: '/audio/chill/SpotiDown.App - Ludlow - James Jackson Jazz Trio.mp3', duration: '5:11' },
    { title: 'Thank God It\'s Friday', src: '/audio/chill/SpotiDown.App - Thank God It_s Friday - Mike Coen.mp3', duration: '6:31' },
  ],
};

const SpotifyPlayer = forwardRef((props, ref) => {
  const [category, setCategory] = useState(() => localStorage.getItem('nexus_audio_category') || 'Lofi');
  const [songIdx, setSongIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('nexus_audio_category', category);
    setSongIdx(0); 
  }, [category]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentPlaylist = PLAYLISTS[category];
    const currentSong = currentPlaylist[songIdx];

    if (currentSong) {
      audio.pause();
      audio.src = currentSong.src;
      audio.load();
      audio.loop = isLooping; // Set native loop property
      if (isPlaying) {
        audio.play().catch(e => console.log("Audio play blocked", e));
      }
    }
  }, [category, songIdx]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    
    const handleEnded = () => {
      if (isLooping) return; // Native loop will handle it
      const currentPlaylist = PLAYLISTS[category];
      setSongIdx(prev => (prev + 1) % currentPlaylist.length);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [category, isLooping]);

  useImperativeHandle(ref, () => ({
    pause: () => { audioRef.current?.pause(); setIsPlaying(false); },
    play: () => { audioRef.current?.play(); setIsPlaying(true); },
  }));

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => alert("File audio belum tersedia."));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleLoop = () => {
    const newState = !isLooping;
    setIsLooping(newState);
    if (audioRef.current) audioRef.current.loop = newState;
  };

  const selectSong = (idx) => {
    setSongIdx(idx);
    setIsPlaying(true);
  };

  const currentPlaylist = PLAYLISTS[category];
  const currentSong = currentPlaylist[songIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <audio ref={audioRef} preload="metadata" />

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '6px', padding: '4px', borderRadius: '12px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-soft)' }}>
        {Object.keys(PLAYLISTS).map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: '9px', fontSize: '11px', fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              backgroundColor: category === cat ? 'var(--bg-card)' : 'transparent',
              color: category === cat ? 'var(--text-main)' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Mini Player Section */}
      <div style={{ 
        padding: '16px', borderRadius: '20px', border: '1px solid var(--border-soft)',
        background: 'linear-gradient(180deg, rgba(59,130,246,0.05) 0%, rgba(13,17,23,0) 100%)',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <button 
          onClick={togglePlay}
          style={{ 
            width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
            backgroundColor: '#3b82f6', color: '#fff',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
          }}
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '2px' }} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 900, textTransform: 'uppercase' }}>Now Playing</span>
                {isPlaying && <Disc size={12} className="animate-spin text-blue-400" />}
              </div>
              <button 
                onClick={toggleLoop}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', 
                  color: isLooping ? '#3b82f6' : 'var(--text-faint)',
                  transition: 'color 0.2s'
                }}
                title={isLooping ? "Looping Active" : "Looping Off"}
              >
                  <Repeat size={16} />
              </button>
          </div>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentSong.title}
          </h4>
          <div style={{ height: '3px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
             <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3b82f6', transition: 'width 0.1s linear' }} />
          </div>
        </div>
      </div>

      {/* Playlist List */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: '4px', 
        maxHeight: '160px', overflowY: 'auto', paddingRight: '4px'
      }} className="scrollbar-hide">
        {currentPlaylist.map((song, i) => (
          <button 
            key={i} 
            onClick={() => selectSong(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
              borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', transition: 'all 0.15s',
              backgroundColor: songIdx === i ? 'rgba(59,130,246,0.08)' : 'transparent',
            }}
          >
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '8px', 
              backgroundColor: songIdx === i ? '#3b82f6' : 'var(--bg-deep)',
              color: songIdx === i ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800
            }}>
              {songIdx === i && isPlaying ? <Disc size={16} className="animate-spin" /> : i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: songIdx === i ? '#60a5fa' : 'var(--text-main)' }}>{song.title}</p>
              <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>{category} Playlist</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

SpotifyPlayer.displayName = 'NexusPlayer';
export default SpotifyPlayer;
