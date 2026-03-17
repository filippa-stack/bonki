import { useNavigate } from 'react-router-dom';
import CompletionCeremony from '@/components/still-us/CompletionCeremony';
import { TOTAL_PROGRAM_CARDS } from '@/data/stillUsSequence';

export default function CeremonyPage() {
  const navigate = useNavigate();

  return (
    <CompletionCeremony
      totalWeeks={TOTAL_PROGRAM_CARDS}
      onComplete={(reflection) => {
        // TODO: save ceremony_reflection + transition to maintenance phase
        navigate('/');
      }}
    />
  );
}
