import { useParams, useNavigate } from 'react-router-dom';
import SessionTwoLive from '@/components/still-us/SessionTwoLive';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';

export default function Session2LivePage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === cardId);
  const cardIndex = card?.index ?? 0;

  // TODO: load real questions from content data
  const vandQuestion = { text: '[PLACEHOLDER] Vänd fråga 2' };
  const tankOmQuestion = { text: '[PLACEHOLDER] Tänk om fråga' };

  return (
    <SessionTwoLive
      cardIndex={cardIndex}
      cardTitle={card?.title ?? ''}
      vandQuestion={vandQuestion}
      tankOmQuestion={tankOmQuestion}
      scenario="[PLACEHOLDER] Scenario text"
      onComplete={(takeaway) => {
        // TODO: call complete_session RPC for session 2 + advance_card
        navigate(`/session/${cardId}/complete`);
      }}
      onPause={() => navigate('/')}
    />
  );
}
