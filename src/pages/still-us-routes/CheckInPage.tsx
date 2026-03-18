import { useParams, useNavigate } from 'react-router-dom';
import SliderCheckIn from '@/components/still-us/SliderCheckIn';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';

export default function CheckInPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === cardId);
  const cardIndex = card?.index ?? 0;

  return (
    <SliderCheckIn
      cardIndex={cardIndex}
      cardId={cardId}
      onBack={() => navigate(-1)}
    />
  );
}
