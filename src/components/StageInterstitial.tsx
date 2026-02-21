/**
 * StageInterstitial no longer renders DOM.
 * Its only role is to signal isTransitioning to StepProgressIndicator
 * via the parent (CardView). Kept as a no-op for import compatibility.
 */

interface StageInterstitialProps {
  visible: boolean;
}

export default function StageInterstitial({ visible }: StageInterstitialProps) {
  return null;
}
