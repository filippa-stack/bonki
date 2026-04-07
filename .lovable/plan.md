

## Rename "Still Us" → "Vårt Vi" (display text only)

### Files to change

**1. `src/data/products/still-us-mock.ts`** (lines 79, 83)
- `name: 'Still Us'` → `name: 'Vårt Vi'`
- `headerTitle: 'Still Us'` → `headerTitle: 'Vårt Vi'`

**2. `src/pages/CardView.tsx`** (3 locations)
- Synthetic manifest `name: 'Still Us'` → `'Vårt Vi'` (~line 1216)
- Synthetic manifest `headerTitle: 'Still Us'` → `'Vårt Vi'` (~line 1220)
- `'Till Still Us'` → `'Till Vårt Vi'` (~line 1824)
- `'Tillbaka till Still Us'` → `'Tillbaka till Vårt Vi'` (~line 2557)

**3. `src/data/productIntros.ts`** (lines 30–31)
- `'Välkommen till Still Us'` → `'Välkommen till Vårt Vi'`
- `'Still Us är för par som...'` → `'Vårt Vi är för par som...'`

**4. `src/components/ProductPaywall.tsx`** (2 locations)
- `'Ingår i Still Us · ...'` → `'Ingår i Vårt Vi · ...'` (~line 251)
- `'Lås upp Still Us'` → `'Lås upp Vårt Vi'` (~line 318)

**5. `src/components/still-us/Share.tsx`** (3 locations)
- Default invite message: `'Det heter Still Us'` → `'Det heter Vårt Vi'` (~line 21)
- Navigator share title: `'Still Us'` → `'Vårt Vi'` (~line 81)
- Descriptive text: `'Still Us är gjort för er båda'` → `'Vårt Vi är gjort för er båda'` (~line 151)

**6. `src/data/notificationTemplates.ts`** (3 locations)
- N1 title: `'Ny vecka i Still Us'` → `'Ny vecka i Vårt Vi'`
- N5 title: `'Still Us väntar på er'` → `'Vårt Vi väntar på er'`
- N7 body: `'Still Us är upplåst'` → `'Vårt Vi är upplåst'`

**7. `src/pages/Home.tsx`** (~line 1335)
- `'resten av Still Us'` → `'resten av Vårt Vi'`

**8. `src/components/LibraryResumeCard.tsx`** (~line 72)
- `productName: 'Still Us'` → `productName: 'Vårt Vi'`

**9. `src/pages/AnalyticsDashboard.tsx`** (~line 134)
- `label: 'Still Us'` → `label: 'Vårt Vi'`

**10. `src/components/DevModeBadge.tsx`** (4 labels, ~lines 75, 83, 91)
- Dev nav labels: `'Intro: Still Us'` → `'Intro: Vårt Vi'`, etc.

**11. `src/pages/still-us-routes/SuIntroPortal.tsx`** (~line 168)
- `'hur Still Us fungerar'` → `'hur Vårt Vi fungerar'`

### NOT changed
- `id: 'still_us'`, `slug: 'still-us'`, variable names, file names, asset refs, code comments

