import { useParams, useNavigate } from 'react-router-dom';
import SessionOneComplete from '@/components/still-us/SessionOneComplete';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';

export default function Session1CompletePage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === cardId);

  return (
    <SessionOneComplete
      cardTitle={card?.title ?? ''}
      onContinue={(takeaway) => navigate(`/session/${cardId}/session2-start`)}
      onSkipTakeaway={() => navigate(`/session/${cardId}/session2-start`)}
    />
  );
}
