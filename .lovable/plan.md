

## Add first-time coaching hint on CardView

Show "Läs frågan högt och prata fritt — varje fråga för samtalet vidare." as a subtle hint on the conversation screen, visible the first 3 sessions, then gone permanently.

### File: `src/pages/CardView.tsx`

**1. Add helpers** (near top, after imports):
```ts
const COACHING_KEY = 'bonki-coaching-hint-count';
function getCoachingCount(): number {
  return parseInt(localStorage.getItem(COACHING_KEY) || '0', 10);
}
function incrementCoachingCount(): void {
  localStorage.setItem(COACHING_KEY, String(getCoachingCount() + 1));
}
```

**2. Add state** inside component:
```ts
const [showCoachingHint] = useState(() => getCoachingCount() < 3);
```

**3. Increment on mount** — use a ref guard to prevent StrictMode double-counting:
```ts
const coachingCounted = useRef(false);
useEffect(() => {
  if (isLive && showCoachingHint && !coachingCounted.current) {
    coachingCounted.current = true;
    incrementCoachingCount();
  }
}, [isLive, showCoachingHint]);
```

**4. Render hint** — above the prompt content block, visible when `isLive && showCoachingHint && localPromptIndex === 0`:
```tsx
{isLive && showCoachingHint && localPromptIndex === 0 && (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6, duration: 0.8 }}
    style={{
      fontFamily: 'var(--font-serif)',
      fontSize: '13px',
      fontStyle: 'italic',
      color: 'var(--accent-text)',
      opacity: 0.55,
      textAlign: 'center',
      lineHeight: 1.5,
      marginBottom: '20px',
      padding: '0 24px',
    }}
  >
    Läs frågan högt och prata fritt — varje fråga för samtalet vidare.
  </motion.p>
)}
```

### Known accepted behaviors
- Hint reappears if user swipes back to prompt 0 within same session (acceptable — soft reminder)
- StrictMode double-count prevented by ref guard

### Unchanged
- Portal pages, progress indicators, all existing ritual overlays

