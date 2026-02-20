import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ResumeBannerProps {
  cardId: string;
}

export default function ResumeBanner({ cardId }: ResumeBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('dismissedResumeBanner') === 'true'
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('dismissedResumeBanner', 'true');
    setDismissed(true);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, hsl(var(--muted) / 0.28) 0%, hsl(var(--muted) / 0.34) 50%, hsl(var(--muted) / 0.28) 100%)',
        padding: '10px 14px',
        borderRadius: '16px',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="mb-3">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Ert samtal väntar.
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)', opacity: 0.6, fontSize: '12px' }}>
            Där ni senast slutade.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="leading-none ml-1 -mt-0.5 -mr-1 transition-opacity hover:opacity-80"
          style={{
            color: 'var(--color-text-secondary)',
            opacity: 0.5,
            fontSize: '16px',
            padding: '8px 10px',
            background: 'none',
            border: 'none',
            lineHeight: 1,
          }}
          aria-label="Stäng"
        >
          ×
        </button>
      </div>
      <button
        onClick={() => navigate(`/card/${cardId}`, { state: { resumed: true } })}
        className="px-5 text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          height: '32px',
          maxWidth: '160px',
          backgroundColor: '#192f24',
          color: 'var(--color-button-text)',
          letterSpacing: '0.2px',
          borderRadius: '20px',
          boxShadow: 'none',
        }}
      >
        Fortsätt
      </button>
    </div>
  );
}
