import { forwardRef, useImperativeHandle, useState } from 'react';
import { Music2 } from 'lucide-react';

const tracks = [
  { label: 'Lofi',  src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0' },
  { label: 'Focus', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0' },
  { label: 'Chill', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX889U0PP8jy7?utm_source=generator&theme=0' },
];

const SpotifyPlayer = forwardRef((props, ref) => {
  const [track, setTrack] = useState(0);

  useImperativeHandle(ref, () => ({
    pause: () => console.log('Programmatic pause not supported for Spotify embed.'),
    play:  () => console.log('Programmatic play not supported for Spotify embed.'),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Track selector */}
      <div style={{ display: 'flex', gap: '6px', padding: '4px', borderRadius: '12px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-soft)' }}>
        {tracks.map((t, i) => (
          <button key={i} onClick={() => setTrack(i)}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              backgroundColor: track === i ? 'var(--bg-card)' : 'transparent',
              color: track === i ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: track === i ? '0 1px 6px rgba(0,0,0,0.15)' : 'none',
            }}
            title={t.label}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Embed */}
      <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <iframe
          key={track}
          src={tracks[track].src}
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ display: 'block' }}
        />
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <Music2 size={10} /> {tracks[track].label} playlist
      </p>
    </div>
  );
});

SpotifyPlayer.displayName = 'FocusPlayer';
export default SpotifyPlayer;
