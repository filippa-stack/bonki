

## Answer: Why the resume card has always been visible in Lovable preview

Short version: it wasn't showing your real DB session. It was showing a hardcoded mock, because you've been browsing with `?devState=…` in the URL.

### What's actually happening in `LibraryResumeCard.tsx`

Two separate code paths render the card. The mock path wins on most preview URLs:

**Path A — Mock (no DB call):**
```ts
const showMock = forceMock || devState === 'library' || devState === 'pairedActive';
const devMock: ResumeData | null = showMock
  ? (global || activeTab === 'barn')
    ? { productName: 'Jag i Mig', cardTitle: 'Glad', cardId: 'jim-glad', stepLabel: 'Pausad vid Fråga 2 av 5', … }
    : { productName: 'Vårt Vi',   cardTitle: 'Att lyssna på riktigt', … }
  : null;
```
If you load `/?devState=library` or `/?devState=pairedActive`, the card renders **immediately** with fake data ("Glad", "Att lyssna på riktigt"). No DB query runs.

**Path B — Local preview (localStorage only, no DB call):**
```ts
const isLocalPreview = isDemoMode() || !!devState;   // ← any devState triggers this
if (isLocalPreview) {
  syncLocalPreview();  // reads getMostRecentDemoSession() from localStorage
  return;              // never calls fetchFromDb()
}
```
For **any other** devState (including `browse`), the effect short-circuits to localStorage demo sessions and never queries `couple_sessions`.

**Path C — Real DB:** only reached when `devState` is null AND `isDemoMode()` is false AND there's a `space.id`. That's the production path you almost never hit while testing.

### So the visibility you've experienced maps to:

| URL                         | What renders                                     | Source               |
|-----------------------------|--------------------------------------------------|----------------------|
| `/?devState=library`        | "Jag i Mig · Glad · Pausad vid Fråga 2 av 5"     | Hardcoded `devMock`  |
| `/?devState=pairedActive`   | Same mock                                        | Hardcoded `devMock`  |
| `/?devState=browse`         | Nothing (or a stale localStorage demo session)   | localStorage         |
| `/?demo=1`                  | Whatever's in localStorage demo session          | localStorage         |
| `/` (clean, logged in)      | Real session from `couple_sessions`              | DB query             |

That's why the card "has always been visible" — you've been on `library` / `pairedActive` URLs, which hand you a guaranteed mock regardless of DB state. And on `browse` it disappears because `browse` isn't in the mock allow-list, but the effect still skips the DB query.

### The actual bug (from your previous message)

You have a real active session in `couple_sessions` (`product_id=jag_i_mig`, `card_id=jim-acklad`) and the card doesn't show on `/?devState=browse`. Cause: the `isLocalPreview` predicate is too broad — `!!devState` swallows `browse` along with the mock states.

### Minimal fix (one file)

`src/components/LibraryResumeCard.tsx` — narrow `isLocalPreview` to match the existing `showMock` allow-list, in both the data-fetch effect and the realtime-subscription effect:

```ts
const isLocalPreview =
  isDemoMode() || devState === 'library' || devState === 'pairedActive';
```

After this:
- `library` / `pairedActive` → still show the hardcoded mock (unchanged).
- `browse` and all other devStates → fall through to the real DB query and render your actual `jim-acklad` session.
- Demo mode → still reads localStorage (unchanged).
- Production (no devState) → unchanged.

### Verification

1. `/?devState=browse`, logged in with active `jim-acklad` → card appears: "Fortsätt utforska Jag i Mig · Pausad vid Fråga X av Y · Ackland". Tap → `/card/jim-acklad`.
2. `/?devState=library` → still shows "Jag i Mig · Glad" mock.
3. `/?devState=pairedActive` → still shows mock.
4. `/` clean → real DB session as today.
5. Pause a card from another tab in scenario 1 → lobby card updates within ~500ms.

### Rollback

Single-file revert of `src/components/LibraryResumeCard.tsx`.

