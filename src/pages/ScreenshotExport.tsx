import { useSearchParams, useNavigate } from 'react-router-dom';
import { CAPTURE_QUEUE, getStoredResults, clearStoredResults } from '@/hooks/useCaptureController';

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)![1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function downloadZip(results: { file: string; label: string; dataUrl: string }[]) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const folder = zip.folder('still-us-screenshots')!;
  for (const r of results) {
    folder.file(r.file, dataUrlToBlob(r.dataUrl));
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'still-us-screenshots.zip';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ScreenshotExport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDone = searchParams.get('sc_done') === '1';
  const results = getStoredResults();

  const handleStart = () => {
    clearStoredResults();
    // Navigate to first capture step
    const params = new URLSearchParams({ __sc_step: '0' });
    if (CAPTURE_QUEUE[0].devState) params.set('devState', CAPTURE_QUEUE[0].devState);
    navigate(`${CAPTURE_QUEUE[0].path}?${params.toString()}`);
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f5f5f3', minHeight: '100vh', padding: '40px 24px', color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Screenshot Export</h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 32 }}>
        Captures all app states at mobile size and packages them as a ZIP file.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <button
          onClick={handleStart}
          style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: '#1c3a2b', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          ▶ Capture all screens
        </button>
        {isDone && results.length > 0 && (
          <button
            onClick={() => downloadZip(results)}
            style={{ padding: '12px 24px', borderRadius: 10, border: '1.5px solid #1c3a2b', background: '#fff', color: '#1c3a2b', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            ⬇ Download ZIP ({results.length} screens)
          </button>
        )}
      </div>

      {isDone && results.length > 0 && (
        <>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>✅ Done! {results.length} screenshots captured.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {results.map((r, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <img src={r.dataUrl} alt={r.label} style={{ width: '100%', display: 'block' }} />
                <div style={{ padding: '10px 14px', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600 }}>{r.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {!isDone && (
        <p style={{ fontSize: 13, color: '#999' }}>
          Click "Capture all screens" — the app will navigate through each state automatically and return here when done.
        </p>
      )}
    </div>
  );
}
