import bonkiLogo from '@/assets/bonki-logo.png';

export default function BackgroundWatermark() {
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-10"
      aria-hidden="true"
    >
      <img
        src={bonkiLogo}
        alt=""
        className="w-20 h-20 object-contain opacity-[0.06] select-none"
        draggable={false}
      />
    </div>
  );
}