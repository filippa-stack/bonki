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
      className="rounded-card"
      style={{
        backgroundColor: 'hsl(var(--muted) / 0.5)',
        padding: '12px 16px',
      }}
    >
      <div className="flex items-start justify-between">
        <p
          className="text-xs mb-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Ni har ett pågående samtal.
        </p>
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
        onClick={() => navigate(`/card/${cardId}`)}
        className="h-9 px-5 text-sm font-medium rounded-button transition-opacity hover:opacity-90"
        style={{
          maxWidth: '220px',
          backgroundColor: 'var(--color-button-primary)',
          color: 'var(--color-button-text)',
        }}
      >
        Fortsätt
      </button>
    </div>
  );
}
