import { useParams, useNavigate } from 'react-router-dom';
import SliderHandoff from '@/components/still-us/SliderHandoff';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';

export default function CheckInHandoffPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const card = CARD_SEQUENCE.find(c => c.cardId === cardId);

  return (
    <SliderHandoff
      partnerName="Partner"
      onPartnerReady={() => {
        // TODO: navigate to partner slider
        navigate(-1);
      }}
      onSkip={() => navigate(-1)}
    />
  );
}
