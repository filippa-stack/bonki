

## Update Wordmark Logo Styling

Apply consistent, minimal styling to the BONKI wordmark `<img>` on both pages — no background, no padding, `maxHeight: 40px`, `width: auto`, `objectFit: contain`.

### Changes

**1. Login page (`src/pages/Login.tsx`, line 142-146)**
- Change the `<img>` style from `{ width: 200, height: 'auto', margin: '0 auto', display: 'block' }` to `{ maxHeight: '40px', width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }`

**2. Library page (`src/components/ProductLibrary.tsx`, lines 688-707)**
- Remove background/padding styles from the wrapping `<motion.h1>` if any exist
- Change the `<img>` style from `{ width: 180, ... }` to `{ maxHeight: '40px', width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block', filter: 'drop-shadow(...)' }`

Both logos will sit directly on their dark page backgrounds with no visible container.

