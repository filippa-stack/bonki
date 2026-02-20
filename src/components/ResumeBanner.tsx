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
        backgroundColor: 'hsl(var(--muted) / 0.3)',
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
          className="text-xs leading-none ml-3 mt-0.5 transition-opacity hover:opacity-100"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}
          aria-label="Stäng"
        >
          ×
        </button>
      </div>
      <button
        onClick={() => navigate(`/card/${cardId}`, { state: { resumed: true } })}
        className="h-9 px-5 text-sm font-medium rounded-button transition-opacity hover:opacity-90"
        style={{
          maxWidth: '160px',
          backgroundColor: 'var(--color-button-primary)',
          color: 'var(--color-button-text)',
          letterSpacing: '0.2px',
        }}
      >
        Fortsätt
      </button>
    </div>
  );
}
