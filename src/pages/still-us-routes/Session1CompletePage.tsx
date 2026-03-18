import { useParams, useNavigate } from 'react-router-dom';
import SessionOneComplete from '@/components/still-us/SessionOneComplete';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';

export default function Session1CompletePage() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === slug);

  return (
    <SessionOneComplete
      cardTitle={card?.title ?? ''}
      onContinue={(takeaway) => navigate(`/session/${slug}/session2-start`)}
      onSkipTakeaway={() => navigate(`/session/${slug}/session2-start`)}
    />
  );
}
