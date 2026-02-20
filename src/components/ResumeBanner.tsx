import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ResumeBannerProps {
  cardId: string;
}

export default function ResumeBanner({ cardId }: ResumeBannerProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-6 mt-4 rounded-card px-4"
      style={{
        backgroundColor: 'hsl(var(--muted) / 0.45)',
        paddingTop: '12px',
        paddingBottom: '12px',
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
        className="h-9 px-5 rounded-button text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          maxWidth: '220px',
          width: '100%',
          backgroundColor: 'var(--color-button-primary)',
          color: 'var(--color-button-text)',
        }}
      >
        Fortsätt
      </button>
    </motion.div>
  );
}
