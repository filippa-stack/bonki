import { useParams, useNavigate } from 'react-router-dom';
import SessionTwoStart from '@/components/still-us/SessionTwoStart';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';
import { getReorientationSummary } from '@/data/reorientationSummaries';

export default function Session2StartPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === cardId);
  const cardIndex = card?.index ?? 0;
  const summary = getReorientationSummary(cardIndex);

  return (
    <SessionTwoStart
      cardIndex={cardIndex}
      cardTitle={card?.title ?? ''}
      reorientationText={summary}
      onStart={() => navigate(`/session/${cardId}/live-session2`)}
    />
  );
}
