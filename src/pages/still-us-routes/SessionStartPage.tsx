import { useParams, useNavigate } from 'react-router-dom';
import SessionOneLive from '@/components/still-us/SessionOneLive';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';

export default function SessionStartPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === cardId);
  const cardIndex = card?.index ?? 0;

  // TODO: load real questions from content data
  const placeholderQuestions = [
    { text: '[PLACEHOLDER] Öppna fråga 1' },
    { text: '[PLACEHOLDER] Öppna fråga 2' },
  ];
  const vandQuestion = { text: '[PLACEHOLDER] Vänd fråga 1' };

  return (
    <SessionOneLive
      cardIndex={cardIndex}
      cardTitle={card?.title ?? ''}
      oppnaQuestions={placeholderQuestions}
      vandQuestion={vandQuestion}
      onComplete={(takeaway) => {
        // TODO: call complete_session RPC for session 1
        navigate(`/session/${cardId}/complete-session1`);
      }}
      onPause={() => navigate('/')}
    />
  );
}
