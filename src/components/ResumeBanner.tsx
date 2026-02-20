import { useNavigate } from 'react-router-dom';

interface ResumeBannerProps {
  cardId: string;
}

export default function ResumeBanner({ cardId }: ResumeBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-card"
      style={{
        backgroundColor: 'hsl(var(--muted) / 0.5)',
        padding: '12px 16px',
      }}
    >
      <p
        className="text-xs mb-3"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Ni har ett pågående samtal.
      </p>
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
