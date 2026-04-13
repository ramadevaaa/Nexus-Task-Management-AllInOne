import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Music2 } from 'lucide-react';

const tracks = [
  { label: 'Lofi', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0' },
  { label: 'Focus', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0' },
  { label: 'Chill', src: 'https://open.spotify.com/embed/artist/2fh2xlcuAMLG1iQkkB0jMm?si=irp5UijnQTmPyY6QzjMKTA' },
];

const SpotifyPlayer = forwardRef((props, ref) => {
  const [track, setTrack] = useState(() => Number(localStorage.getItem('nexus_spotify_track')) || 0);
  const [customUrl, setCustomUrl] = useState(() => localStorage.getItem('nexus_spotify_custom_url') || '');
  const [isCustom, setIsCustom] = useState(() => localStorage.getItem('nexus_spotify_is_custom') === 'true');

  useEffect(() => {
    localStorage.setItem('nexus_spotify_track', track);
    localStorage.setItem('nexus_spotify_custom_url', customUrl);
    localStorage.setItem('nexus_spotify_is_custom', isCustom);
  }, [track, customUrl, isCustom]);

  useImperativeHandle(ref, () => ({
    pause: () => console.log('Programmatic pause not supported for Spotify embed.'),
    play: () => console.log('Programmatic play not supported for Spotify embed.'),
  }));

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      // Handle standard spotify links
      if (url.includes('open.spotify.com') && !url.includes('/embed')) {
        return url.replace('open.spotify.com/', 'open.spotify.com/embed/') + "?utm_source=generator&theme=0";
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const currentSrc = isCustom ? getEmbedUrl(customUrl) : tracks[track].src;
  const currentLabel = isCustom ? 'Custom' : tracks[track].label;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Track selector */}
      <div style={{ display: 'flex', gap: '6px', padding: '4px', borderRadius: '12px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-soft)' }}>
        {tracks.map((t, i) => (
          <button key={i} onClick={() => { setTrack(i); setIsCustom(false); }}
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
              backgroundColor: !isCustom && track === i ? 'var(--bg-card)' : 'transparent',
              color: !isCustom && track === i ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: !isCustom && track === i ? '0 1px 6px rgba(0,0,0,0.15)' : 'none',
            }}
            title={t.label}>
            {t.label}
          </button>
        ))}
        <button onClick={() => setIsCustom(true)}
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
            backgroundColor: isCustom ? 'var(--bg-card)' : 'transparent',
            color: isCustom ? 'var(--text-main)' : 'var(--text-muted)',
            boxShadow: isCustom ? '0 1px 6px rgba(0,0,0,0.15)' : 'none',
          }}
          title="Custom Playlist">
          Custom
        </button>
      </div>

      {/* Custom Input */}
      {isCustom && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Paste Spotify Playlist URL..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '11px',
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--border-soft)',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Embed */}
      <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {currentSrc ? (
          <iframe
            key={currentSrc}
            src={currentSrc}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ display: 'block' }}
          />
        ) : (
          <div style={{ height: '152px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-deep)', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
            Please paste a Spotify Playlist URL above
          </div>
        )}
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <Music2 size={10} /> {currentLabel} playlist
      </p>
    </div>
  );
});

SpotifyPlayer.displayName = 'FocusPlayer';
export default SpotifyPlayer;
