# Library — match approved mockup composition

Three targeted fixes. `KidsTileFrame` already renders correctly (16px inset, rounded interior, 30% strip, hairline). The bugs are in callers and in the calm-variant table.

## 1. `src/lib/productTileVariants.ts` — fix invisible inner zones (root cause)

For four products, `calmIndex` points to a variant **identical to the frame color**, so the inner zone is invisible. Remap each `calmIndex` to a visibly lighter (or darker) variant:

| Product | Frame | Current calm (broken) | New calm |
|---|---|---|---|
| `jag_i_mig` | `#E89B6B` | `#E0926A` (idx 1) — too close | `#F2BC97` (idx 3, lighter) |
| `jag_med_andra` | `#CB7AB2` | `#CB7AB2` (idx 1) — **identical** | `#DCA1C8` (idx 2, lighter) |
| `jag_i_varlden` | `#C6D423` | `#C6D423` (idx 1) — **identical** | `#D4DE48` (idx 2, lighter) |
| `vardagskort` | `#8BDDB0` | `#8BDDB0` (idx 1) — **identical** | `#C4F0DA` (idx 3, lighter) |
| `syskonkort` | `#CF8BDD` | `#CF8BDD` (idx 2) — **identical** | `#EAC8EE` (idx 4, lighter) |
| `sexualitetskort` | `#B87560` | `#B06D58` (idx 1) — too close | `#CFA08D` (idx 3, lighter) |

Each new calm variant already exists in the `variants` array; only the `calmIndex` integer changes per product. Keeps `getInteriorForCard` (in-product card grid) untouched.

## 2. `src/components/ProductLibrary.tsx` — `LibraryHeader` order

Swap so title comes first:

```tsx
<h1>Biblioteket</h1>          // 28px Fraunces, marginBottom: 6
<p>Samtal för hela familjen</p>  // 10px small-caps eyebrow, opacity 0.55
```

## 3. `src/components/ProductLibrary.tsx` — `StillUsMarquee` add SAMTAL eyebrow

In the right column, replace the standalone pill with a row containing pill + small-caps eyebrow side by side:

```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
  <span /* progress pill, unchanged */ />
  <span style={{
    fontFamily: 'var(--font-body)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(253, 246, 227, 0.55)',
  }}>
    {totalCards} samtal
  </span>
</div>
```

Bump container padding `'20px 16px'` → `'22px 18px'` for the requested breathing room. Medallion stays 110×110 with 70% inner image (already correct).

## What stays unchanged

- `KidsTileFrame` primitive (already renders 16px inset interior, 30% strip, hairline at strip top)
- `LibraryKidsTile` callsite (`stripFraction={0.30}`, illustration 70%/70%, `metaTrailing` for tasted state)
- Section eyebrows, locked kids order, 12px gap, disclaimer copy, resume card, nudges
- Product home tiles — they use `getInteriorForCard` (position-indexed), not `getCalmInterior`, so unaffected

## Verification (390×844)

1. Header reads: large serif "Biblioteket" then small-caps "SAMTAL FÖR HELA FAMILJEN" below.
2. Vårt Vi marquee: 110px medallion left; right column shows title, italic subtitle, then pill + "21 SAMTAL" eyebrow on one row.
3. Each kids tile shows a clearly lighter rounded-rectangle inner zone inset 16px from the frame edge — frame band visible on all four sides of the interior.
4. Hairline visible between inner zone bottom and title strip top.
5. Disclaimer "Åldrarna är en vägledning. Ni känner ert barn bäst." present below FÖR BARN section.
