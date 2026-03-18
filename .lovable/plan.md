

# Kids Product UX Structure — Using "Jag i mig" as Example

## Flow Overview

```text
┌─────────────────┐
│  ProductLibrary  │  (the Lobby — "/" route)
│  "Biblioteket"   │
│                  │
│  ┌─────────────┐ │
│  │ Jag i mig   │ │  ← illustrated tile, tagline "När känslor får ord"
│  │ tile        │──┼──► /product/jag-i-mig
│  └─────────────┘ │
└─────────────────┘
         │
         ▼
┌─────────────────────┐
│  ProductIntro        │  (one-time onboarding per product)
│  - accent color      │
│  - free card offer   │
│  onComplete → ▼      │
└─────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│  JagIMigProductHome                               │
│  /product/jag-i-mig                               │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Hero: illustration-jag-i-mig.png             │ │
│  │ Title: "Jag i mig"                           │ │
│  │ Subtitle: "När känslor får ord" (accent)      │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ UnifiedResumeBanner (if active session)       │ │
│  │ - card name, step progress, "Fortsätt" CTA   │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ NextConversationCard (if no active session)   │ │
│  │ - "Nästa samtal" with card illustration       │ │
│  │ - taps → /card/:cardId                        │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ CategoryTileGrid (2-col portrait tiles)       │ │
│  │                                                │ │
│  │  ┌────────┐  ┌────────┐                       │ │
│  │  │ Mina   │  │ Starka │                       │ │
│  │  │känslor │  │känslor │                       │ │
│  │  │ 3/7 ●● │  │ 0/7    │  ← progress dots     │ │
│  │  └────┬───┘  └────┬───┘                       │ │
│  │       │           │                            │ │
│  │  ┌────────┐       │                            │ │
│  │  │ Stora  │       │                            │ │
│  │  │känslor │       │                            │ │
│  │  └────┬───┘       │                            │ │
│  └───────┼───────────┼───────────────────────────┘ │
└──────────┼───────────┼────────────────────────────┘
           │           │
           ▼           ▼
┌──────────────────────────────────────┐
│  Category page                        │
│  /category/:categoryId                │
│  e.g. /category/jim-mina-kanslor      │
│                                        │
│  - Header with back button            │
│  - Card list with:                     │
│    • Card image (from ZIP)             │
│    • Title + subtitle                  │
│    • CardStatusBadge (✓ / in-progress) │
│    • 14-day expiry on completions      │
│  - Each card taps → /card/:cardId      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  CardView (3,059 lines)               │
│  /card/:cardId                        │
│  e.g. /card/jim-trygg                 │
│                                        │
│  Mode: live | archive | completion     │
│                                        │
│  LIVE SESSION:                         │
│  ┌────────────────────────────────┐   │
│  │ SessionFocusShell              │   │
│  │ - dimmed background            │   │
│  │ - pause/exit controls          │   │
│  │                                │   │
│  │ StepProgressIndicator          │   │
│  │ (1 step per card for kids)     │   │
│  │                                │   │
│  │ SessionStepReflection          │   │
│  │ - prompts shown one at a time  │   │
│  │ - "Nästa fråga" button         │   │
│  │ - optional typed reflection    │   │
│  └────────────────────────────────┘   │
│                                        │
│  ON COMPLETION:                        │
│  ┌────────────────────────────────┐   │
│  │ CompletedSessionView           │   │
│  │ - takeaway prompt              │   │
│  │ - feedback sheet               │   │
│  │ - "Tillbaka" → product home    │   │
│  └────────────────────────────────┘   │
└──────────────────────────────────────┘
```

## Key Data Structures

**ProductManifest** — defines a product:
- `id`: `'jag_i_mig'`
- `categories[]`: 3 categories (Mina/Starka/Stora känslor), each with 7 cards = 21 total
- `cards[]`: each has `sections[].prompts[]` (conversation questions)
- `pronounMode`: `'du'` (solo/child-facing)
- `freeCardId`: one card playable without purchase
- `accentColor`, `backgroundColor`, `ctaButtonColor` — theme tokens

**KidsProductProgress** — runtime state from `useKidsProductProgress`:
- `recentlyCompletedCardIds` — completions < 14 days old
- `activeSession` — resume data (card, step index)
- `nextSuggestedCardId` — first uncompleted card in order
- `categoryProgress` — per-category `{ completed, total, allDone }`

## Screen-by-Screen Summary

| # | Screen | Route | Component | Purpose |
|---|--------|-------|-----------|---------|
| 1 | Library | `/` | `ProductLibrary` | Product grid with illustrated tiles, resume banners |
| 2 | Product Intro | (inline) | `ProductIntro` | One-time product onboarding, free card offer |
| 3 | Product Home | `/product/:slug` | `JagIMigProductHome` | Hero + resume/next card + category grid |
| 4 | Category | `/category/:id` | `Category` | Card list with status badges |
| 5 | Card Session | `/card/:id` | `CardView` | Live prompts → completion → takeaway |

## Design Patterns

- **Each product has its own ProductHome component** with bespoke colors, hero image, and tile layout (not a generic template)
- **CategoryTileGrid** is shared — receives tile configs, images, and per-tile opacity/scale styles
- **14-day expiry**: completion markers fade after 2 weeks, encouraging revisits
- **1-step sessions**: kids cards have a single "opening" section with 3-4 prompts (no multi-beat structure like Still Us)
- **Card images loaded from ZIP**: `useCardImage` extracts PNGs from product ZIP files for performance

