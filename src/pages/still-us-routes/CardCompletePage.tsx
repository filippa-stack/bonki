import { useParams, useNavigate } from 'react-router-dom';
import CardComplete from '@/components/still-us/CardComplete';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';

export default function CardCompletePage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === cardId);
  const cardIndex = card?.index ?? 0;

  return (
    <CardComplete
      cardIndex={cardIndex}
      cardTitle={card?.title ?? ''}
      onComplete={(takeaway) => {
        // TODO: call advance_card RPC
        navigate('/');
      }}
      onSkipTakeaway={() => {
        // TODO: call advance_card without takeaway
        navigate('/');
      }}
    />
  );
}
