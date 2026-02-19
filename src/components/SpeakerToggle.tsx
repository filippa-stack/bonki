const STORAGE_KEY = 'still_us_speaker';

type Speaker = 'A' | 'B';

import { useState, useCallback } from 'react';

export function useSpeaker() {
  const [speaker, _setSpeaker] = useState<Speaker>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'B' ? 'B' : 'A';
  });

  const setSpeaker = useCallback((value: Speaker) => {
    localStorage.setItem(STORAGE_KEY, value);
    _setSpeaker(value);
  }, []);

  return { speaker, setSpeaker };
}

interface SpeakerToggleProps {
  speaker: Speaker;
  onChange: (speaker: Speaker) => void;
}

export default function SpeakerToggle({ speaker, onChange }: SpeakerToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border/40 p-0.5">
      {(['A', 'B'] as Speaker[]).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={[
            'w-7 h-6 text-xs font-medium rounded-md transition-colors',
            speaker === s
              ? 'bg-foreground/8 text-foreground border border-border/60'
              : 'text-muted-foreground/50 hover:text-muted-foreground border border-transparent',
          ].join(' ')}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
