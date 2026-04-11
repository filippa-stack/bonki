

## Implement PostHog Analytics Infrastructure

### Step 1 — Request `VITE_POSTHOG_KEY`
Use `add_secret` to request the PostHog project API key from you. Find it in **PostHog → Project Settings → Project API Key**.

### Step 2 — Install `posthog-js`

### Step 3 — Create `src/lib/posthog.ts`
```typescript
import posthog from 'posthog-js'

export const initPostHog = () => {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: 'https://eu.i.posthog.com',
    capture_pageview: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-sensitive]',
    },
    persistence: 'localStorage',
  })
}

export { posthog }
```

### Step 4 — Update `src/main.tsx`
Insert import + `initPostHog()` between line 6 and line 8 (after imports, before `createRoot`):

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/themes.css";
import "./i18n";
import { initPostHog } from './lib/posthog';

initPostHog();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

No reordering. Two lines added between existing imports and `createRoot`.

### Step 5 — Create `src/hooks/useAnalytics.ts`
Thin wrapper with `track` and `identify`.

### Step 6 — Add `data-sensitive` to sensitive components
Add the attribute to the outermost wrapper in each:
- `LockedReflectionDisplay` — reflection text
- `SessionStepReflection` — textarea wrapper
- `SessionTakeaway` — outer div
- `ReflectionMemoryCard` — button element
- `CardReflections` / `CardTakeaways`
- `still-us/SoloReflect.tsx`
- `Diary.tsx` / `Journal.tsx`
- `SavedConversations.tsx`
- `ArchiveTakeaway.tsx`
- `RelationshipMemory.tsx`
- `KidsCardPortal.tsx`

### What is NOT touched
- No reordering of existing imports or theme logic
- No AnimatePresence, routing, or ref pattern changes
- No tracking events — infrastructure only

### After it runs — verification checklist
1. I'll paste the `main.tsx` diff here for you to confirm insertion point
2. Check PostHog → Live Events for `$pageview` events
3. Confirm `VITE_POSTHOG_KEY` is set in secrets

