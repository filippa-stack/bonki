import { useNavigate } from 'react-router-dom';
import FormatPreview from '@/components/still-us/FormatPreview';

export default function FormatPreviewPage() {
  const navigate = useNavigate();
  return <FormatPreview onComplete={() => navigate(-1)} />;
}
