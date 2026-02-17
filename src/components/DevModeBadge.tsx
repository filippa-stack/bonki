import { useDevState } from '@/contexts/DevStateContext';

export default function DevModeBadge() {
  const devState = useDevState();
  if (!devState) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[9999] pointer-events-none select-none">
      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-black/60 text-white/80 backdrop-blur-sm">
        DEV MODE · {devState}
      </span>
    </div>
  );
}
