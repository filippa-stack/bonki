

# Still Us — Kids Architecture Mock Test

## Goal
Create a mock version of Still Us that uses the exact same architecture as the kids products: **ProductHome (category tiles) → Portal (card entry) → Session (single-level questions) → Completion (with teamwork as bonus)**. This lets you compare the two UX patterns side by side.

## How it works

The 5 existing Still Us layers become categories, and the 22 cards map into them. The session strips out the slider check-in and multi-session flow — instead, each card is a single conversation (like kids products) with Opening + Reflective questions as the main session and the Scenario/Exercise ("Teamwork") offered on the completion screen as a bonus.

## Technical approach

### 1. Create a Still Us ProductManifest
**New file: `src/data/products/still-us-mock.ts`**

- Define a `ProductManifest` using the 5 LAYERS as categories (Grunden, Normen, Konflikten, Längtan, Valet)
- Map each of the 22 cards from `content.ts` into the manifest's `cards[]` array, assigned to the correct category
- Each card keeps only its `opening` and `reflective` sections as the primary session content (matching kids' single-section model)
- Scenario + Exercise sections are preserved in the data but flagged for the completion bonus
- Use Still Us colors (Ember Night, Saffron, etc.) for accent/tile colors
- Set `pronounMode: 'ni'`

### 2. Register the mock product
**Edit: `src/data/products/index.ts`**

- Import and add `stillUsMockProduct` to `allProducts[]`
- This automatically makes it appear in the library and work with all existing kids infrastructure (KidsProductHome, KidsCardPortal, CardView, CompletedSessionView)

### 3. No new components needed
The existing kids infrastructure handles everything:
- **KidsProductHome** renders the 5 category tiles
- **KidsCardPortal** shows the next unplayed card in each category with swipe navigation
- **CardView** runs the session (Opening → Reflective steps, with the stage interstitial animation before Scenario)
- **CompletedSessionView** shows the completion screen with "Nästa samtal" navigation

### 4. Completion bonus (Teamwork/Exercise)
The existing `CardView` already renders `scenario` and `exercise` sections when present. The stage interstitial animation already fires when transitioning into Scenario. No changes needed — the content structure handles this automatically.

## What you get
- Still Us content accessible via: Library → "Still Us (test)" tile → Category tiles (Grunden, Normen, etc.) → Portal → Session → Completion
- Same swipe navigation, progress tracking, and "Nästa samtal" logic as kids products
- No changes to the existing Still Us flow — both versions coexist
- Easy to remove later (delete the manifest file and remove from index)

## Files changed
| File | Action |
|---|---|
| `src/data/products/still-us-mock.ts` | **Create** — ProductManifest with 5 categories, 22 cards |
| `src/data/products/index.ts` | **Edit** — Add import + register in `allProducts` |

## SHARED FILE CHANGES REQUIRED
None — this approach uses only the products data layer. The kids components are generic and render any ProductManifest automatically.

