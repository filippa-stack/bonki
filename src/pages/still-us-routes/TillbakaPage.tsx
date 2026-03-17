import { useParams, useNavigate } from 'react-router-dom';
import TillbakaSessionLive from '@/components/still-us/TillbakaSessionLive';
import { getTillbakaCard } from '@/data/tillbakaCards';

export default function TillbakaPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  // cardId format: "tillbaka-0", "tillbaka-1", etc.
  const indexStr = cardId?.replace('tillbaka-', '') ?? '0';
  const tillbakaIndex = parseInt(indexStr, 10) || 0;
  const card = getTillbakaCard(tillbakaIndex);

  return (
    <TillbakaSessionLive
      tillbakaIndex={tillbakaIndex}
      title={card?.title ?? 'Tillbaka'}
      question1={card?.question1 ?? '[PLACEHOLDER]'}
      question2={card?.question2 ?? '[PLACEHOLDER]'}
      onComplete={(notes) => {
        // TODO: mark tillbaka complete + advance maintenance_card_index
        navigate('/');
      }}
      onPause={() => navigate('/')}
    />
  );
}
