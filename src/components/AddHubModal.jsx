import { useState, useEffect } from 'react';
import { X, Link2 } from 'lucide-react';

const EMOJI_OPTIONS = ['🔗', '📋', '🗂️', '🧩', '🛠️', '📊', '🎯', '💡', '📝', '🚀', '🌐', '💼'];

export default function AddHubModal({ isOpen, onClose, onSave, portal = null }) {
  const [title, setTitle]         = useState(portal?.title || '');
  const [url, setUrl]             = useState(portal?.url || '');
  const [icon, setIcon]           = useState(portal?.icon || '🔗');
  const [showPicker, setShowPicker] = useState(false);

  // Update state if portal prop changes
  useEffect(() => {
    if (portal) {
      setTitle(portal.title || '');
      setUrl(portal.url || '');
      setIcon(portal.icon || '🔗');
    } else {
      setTitle('');
      setUrl('');
      setIcon('🔗');
    }
  }, [portal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    onSave({ title: title.trim(), url: fullUrl, icon }, portal?.id);
    if (!portal) {
       setTitle(''); setUrl(''); setIcon('🔗');
    }
    onClose();
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    fontFamily: 'inherit',
    border: '1px solid #2a3347',
    backgroundColor: '#0d1117',
    color: '#f1f5f9',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div
        style={{ backgroundColor: '#161b27', border: '1px solid #252f42', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #252f42', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link2 size={16} style={{ color: '#60a5fa' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>{portal ? 'Edit Quick Portal' : 'Add Quick Portal'}</p>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#8b9ab5', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252f42'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Icon picker */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8b9ab5', marginBottom: '8px' }}>Icon</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  style={{
                    width: '56px', height: '56px', fontSize: '24px', textAlign: 'center',
                    borderRadius: '14px', border: '1px solid #2a3347', backgroundColor: '#0d1117',
                    color: '#f1f5f9', outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#2a3347'}
                  maxLength={5}
                />
                <button
                  type="button"
                  onClick={() => setShowPicker(!showPicker)}
                  style={{
                    fontSize: '13px', color: '#3b82f6', background: 'none',
                    border: 'none', cursor: 'pointer', fontWeight: 600, padding: '4px 8px', borderRadius: '8px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {showPicker ? 'Close presets' : 'Choose preset'}
                </button>
              </div>

              {showPicker && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginTop: '10px', padding: '12px', backgroundColor: '#0d1117', border: '1px solid #2a3347', borderRadius: '14px' }}>
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e} type="button"
                      onClick={() => { setIcon(e); setShowPicker(false); }}
                      style={{
                        fontSize: '22px', padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                        backgroundColor: icon === e ? 'rgba(59,130,246,0.2)' : 'transparent',
                      }}
                      onMouseEnter={e2 => e2.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.12)'}
                      onMouseLeave={e2 => e2.currentTarget.style.backgroundColor = icon === e ? 'rgba(59,130,246,0.2)' : 'transparent'}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* App Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8b9ab5', marginBottom: '8px' }}>App name</label>
              <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)} required
                style={inputStyle} placeholder="e.g. Notion, Figma, Linear"
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#2a3347'}
              />
            </div>

            {/* URL */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8b9ab5', marginBottom: '8px' }}>URL</label>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} required
                style={inputStyle} placeholder="https://notion.so"
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#2a3347'}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #252f42', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, border: '1px solid #252f42', backgroundColor: 'transparent', color: '#8b9ab5', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252f42'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              Cancel
            </button>
            <button type="submit"
              style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(59,130,246,0.4)', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              {portal ? 'Update Portal' : 'Add Portal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
