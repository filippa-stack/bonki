# Five atomic fixes

## 1. Vårt Vi tile subtitle → "De samtal ni redan vill ha"

- `src/components/ProductLibrary.tsx:49`
- `src/components/ProductLibraryMock.tsx:56`
- `src/components/ProductIntroMock.tsx:49`

## 2. Hero subtitle → "De samtal ni redan vill ha"

- `src/contexts/SiteSettingsContext.tsx:30` (`heroSubtitle`)

## 3. Library section heading "Föräldrar" → "Par"

- `src/components/ProductLibrary.tsx:669` (visible heading)
- `src/components/ProductLibraryMock.tsx:523` (mock heading)
- Update nearby comments at ProductLibrary.tsx:451, 494, 719 and ProductLibraryMock.tsx:522 for grep consistency

No routing/filter keys reference the string.

## 4. Vårt Vi portal back → product home (not library)

Add optional `to?: string` prop to `src/components/ProductHomeBackButton.tsx`. When provided, navigate there; otherwise preserve current behavior (clear last-active-product, navigate `/`).

In `src/pages/AdultCardPortal.tsx:216`, pass `to="/product/still-us"`.

All other consumers (Home, all product home pages) unchanged.

## 5. Single-select chips for kids products

`src/components/KidsProductHome.tsx:687` — add `selectionMode="single"` to `<CategoryFilterChips>`. Propagates to all kids products (jim/jma/jiv/vk/sk/sex).

## Verification

- Library tile subtitle and hero subtitle both read "De samtal ni redan vill ha"
- Library section heading reads "Par"
- Vårt Vi card portal back chevron lands on `/product/still-us`
- Vårt Vi product home back still goes to library
- Kids product chips are single-select with sliding underline
