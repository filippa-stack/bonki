

## Fix bottom CTA clutter in session views

The three problems: "Föregående" has no visual weight, "Fortsätt" is off-center, and "Pausa för idag" is a redundant third action (the X button already triggers pause).

### How premium apps solve this

Apps like Headspace, Calm, and Duolingo keep the primary CTA **full-width and centered** — always the dominant visual anchor. Navigation back is handled by a small **chevron icon** (not a text label), and exit/pause lives exclusively in the top-right close button. No bottom area ever has more than one row of actions.

### Solution

**1. Replace "Föregående" text with a chevron-left icon button**
- Small `ChevronLeft` icon (20px) in a 44×52px touch target
- Same opacity treatment (0.7), positioned left of the CTA
- Visually reads as "back" without competing with the CTA text

**2. Keep "Fortsätt" as the dominant element**
- The CTA takes `flex: 1` in the row — the small icon button beside it barely affects centering
- Visual weight ratio becomes ~90/10 instead of the current ~40/60

**3. Remove "Pausa för idag" from the bottom entirely**
- The X button in the header already opens "Pausa samtalet?" — this is the correct exit point
- One less action = cleaner, calmer bottom zone

### Files to edit

**`src/components/SessionStepReflection.tsx`**
- Replace the "Föregående" text button with a `ChevronLeft` icon button (same `onBack` handler)
- Remove the "Pausa för idag" button block (lines ~394-414)
- Remove `pauseLabel` and `onPause` from the props interface

**`src/pages/CardView.tsx`** (multiple CTA areas)
- Same pattern: replace all "Föregående" text buttons with `ChevronLeft` icon buttons
- Remove any standalone "Pausa för idag" buttons in the kids product CTA areas
- Stop passing `pauseLabel` / `onPause` to `SessionStepReflection`

**`src/components/still-us/SessionOneLive.tsx`**
- Replace "Föregående" text with chevron icon
- Remove "Pausa för idag" (X button handles it)

**`src/components/still-us/SessionTwoLive.tsx`**
- Same changes

**`src/components/TillbakaSessionLive.tsx`**
- Same changes (remove "Pausa för idag", chevron for back)

### Visual result

```text
Before:                          After:
┌────────────────────────┐      ┌────────────────────────┐
│ Föregående   [Fortsätt]│      │ ‹  [    Fortsätt     ] │
│     Pausa för idag     │      └────────────────────────┘
└────────────────────────┘
```

### Unchanged
- X button behavior and "Pausa samtalet?" dialog (already correct)
- Completion screen CTA layout
- All handleSmartExit / pause logic

