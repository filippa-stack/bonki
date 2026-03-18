import { useParams, useNavigate } from 'react-router-dom';
import CardComplete from '@/components/still-us/CardComplete';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';
import { cardIdFromSlug } from '@/lib/stillUsTokens';

export default function CardCompletePage() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === slug);
  const cardIndex = card?.index ?? 0;
  const backendCardId = cardIdFromSlug(slug ?? '') ?? `card_${cardIndex + 1}`;

  return (
    <CardComplete
      cardIndex={cardIndex}
      cardTitle={card?.title ?? ''}
      onComplete={(takeaway) => {
        // TODO: call advance_card RPC with backendCardId
        navigate('/');
      }}
      onSkipTakeaway={() => {
        // TODO: call advance_card without takeaway
        navigate('/');
      }}
    />
  );
}
