import React, { useState } from 'react';
import { transcribeToThai } from './transcribeService';

function App() {
  const [url, setUrl] = useState('');
  const [segments, setSegments] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setSegments([]);
    setStatus('Connecting to your local translation server...');
    
    // Clean Client-Side Robust URL Link Filter
    const videoMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu.be\/)([a-zA-Z0-9_-]{11})/);
    const extractedId = videoMatch ? videoMatch[1] : null;

    if (!extractedId) {
      setStatus('Invalid YouTube link format! Try copying a clean share link.');
      setLoading(false);
      return;
    }

    const result = await transcribeToThai(url, (step) => {
      if (step === 0) setStatus('Validating YouTube link structure...');
      if (step === 1) setStatus('Scraping timed captions & translating text on-the-fly...');
      if (step === 2) setStatus('Finalizing synchronized timestamp data arrays!');
    });

    if (result.segments && result.segments.length > 0) {
      setSegments(result.segments);
      setStatus(`Success! Generated ${result.segments.length} Thai subtitle timestamps.`);
    } else {
      setStatus('Could not generate subtitles. Make sure your server window is open and running on Render.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#5b21b6', marginBottom: '5px' }}>🎬 Limitless Thai Transcript Dashboard</h1>
      <p style={{ color: '#475569', marginTop: '0', marginBottom: '30px' }}>Uncapped subtitle extraction engine running directly on your own cloud network.</p>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input 
          type="text" 
          placeholder="Paste any YouTube video or shorts link here..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '14px 28px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          {loading ? 'Processing...' : 'Translate'}
        </button>
      </form>

      {status && (
        <div style={{ padding: '14px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '25px', fontSize: '14px', color: '#334155', borderLeft: '4px solid #7c3aed', fontWeight: '500' }}>
          {status}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '25px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>📜 Thai Caption Timeline Stream</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
          {segments.length === 0 ? (
            <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '20px 0' }}>No active translation session. Paste a media link above to execute an extraction.</p>
          ) : (
            segments.map((seg, idx) => (
              <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <span style={{ color: '#7c3aed', fontWeight: 'bold', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'nowrap', background: '#f5f3ff', padding: '2px 6px', borderRadius: '4px' }}>
                  [{seg.start.toFixed(1)}s]
                </span>
                <span style={{ color: '#1e293b', lineHeight: '1.6', fontSize: '15px' }}>
                  {seg.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
