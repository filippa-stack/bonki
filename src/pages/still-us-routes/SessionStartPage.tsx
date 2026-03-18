import SessionOneLive from '@/components/still-us/SessionOneLive';

/**
 * SessionStartPage — route wrapper for /session/:cardId/live.
 * SessionOneLive reads its own params internally.
 */
export default function SessionStartPage() {
  return <SessionOneLive />;
}
