import { useParams, useNavigate } from 'react-router-dom';
import SessionTwoStart from '@/components/still-us/SessionTwoStart';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';
import { getReorientationSummary } from '@/data/reorientationSummaries';

export default function Session2StartPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === cardId);
  const summary = getReorientationSummary(card?.index ?? 0);

  return (
    <SessionTwoStart
      cardTitle={card?.title ?? ''}
      reorientationText={summary}
      onContinue={() => navigate(`/session/${cardId}/live-session2`)}
    />
  );
}
