## Mål

Sju Google Play-skärmdumpar på `1080×1920 px` med samma komposition (caption-zon, hårlinje, app-skärm-zon), samma captions och samma `Screen*`-komponenter som App Store-versionen — men med Android-chrome (Pixel 8-stil).

## Justeringar (från godkännande)

1. **Caption-skala −15%** appliceras direkt i `GRAPHICS`-arrayen för Google Play-routen: `140 → 120`, `130 → 112`, `120 → 104`.
2. **Frame aspect 1:1.34** är medvetet val för att bevara `INNER_LOGICAL_W = 390 px` viewport som `Screen*`-komponenterna är designade för. Skickar som planerat.
3. **Status bar timestamp** = `12:00` (Android-konvention), inte `9:41`.
4. **Punch-hole** = pure black fyllning + 1 px hairline-ring i `LANTERN_GLOW` @ 30% opacity för synlighet mot djupa bakgrunder (t.ex. `JIM_DEEP` terracotta).

## Arkitektur

Ingen ändring i befintliga `src/pages/export/screenshots/Screen{1-7}*.tsx`, `composition.tsx`, eller App Store-flödet. Allt nytt läggs sida vid sida.

### 1. Ny composition-modul

**Fil:** `src/lib/exportScreenshot/compositionAndroid.tsx`

Speglar `composition.tsx` med Android-anpassade konstanter och primitiver:

```text
CANVAS_W = 1080
CANVAS_H = 1920

// Skalat proportionellt mot App Store-versionen
TOP_BREATH_PX        = 117   (var 169 → ×0.691)
CAPTION_ZONE_TOP_PX  = 117
CAPTION_ZONE_HEIGHT  = 494   (var 715)
HAIRLINE_TOP_PX      = 625   (var 904)
FRAME_TOP_PX         = 666   (var 964)
FRAME_WIDTH_PX       = 907   (var 1079, 84% av canvas-bredden)
FRAME_HEIGHT_PX      = 1218  (var 1689; aspect ≈ 1:1.34 — medvetet val)
INNER_LOGICAL_W      = 390   (oförändrat — Screen*-komponenter förblir samma)
```

Exporter: `GooglePlayCanvas`, `CaptionZone`, `HairlineDivider`, `AndroidDeviceFrame`.

### 2. Android-device-frame

- **Punch-hole** (top-center): cirkel `Ø 28 px` absolut-positionerad `top: 18 px, left: 50%`, `background: #000`, `border: 1px solid rgba(245, 232, 204, 0.30)` (LANTERN_GLOW @ 30%), `z-index: 11`. Garanterar synlighet mot både `MIDNIGHT_INK` och `JIM_DEEP`.
- **Hörnradie:** `innerRadius = 60` (Pixel 8-stil, skarpare än iPhone), `bezel = 10`.
- **AndroidStatusBar:**
  - Höjd `48 px`, padding `0 48px`, fontfamilj `"Roboto", "Inter", -apple-system, sans-serif`, fontsize `30 px`, fontweight `500`.
  - Vänster: **`12:00`** (Android-konvention).
  - Höger: signal-staplar (Material-stil, 4 staplar), Wi-Fi (Material-triangel), batteri-rektangel utan tip, ikoner ~`26 px`.
- **AndroidNavBar** (ersätter HomeIndicator): gestur-pill `width: 320 px, height: 6 px, borderRadius: 3 px, bg: rgba(255,255,255,0.85)`, `bottom: 14 px`, centrerad.
- `showChrome={false}` döljer status bar + nav bar (men behåller punch-hole — den är fysisk hårdvara, inte UI-chrome).

### 3. Ny export-route-komponent

**Fil:** `src/pages/export/GooglePlayScreenshot.tsx`

Klon av `AppStoreScreenshot.tsx` med:
- Imports från `compositionAndroid`.
- `GooglePlayCanvas` + `AndroidDeviceFrame`.
- Filnamn: `google-play-${n}-${name}.png`.
- Nav-länkar: `/export/google-play/${n}`.
- Rubrik: `Google Play screenshot N/7`.
- `GRAPHICS`-arrayen: identiska captions, `canvasBg`/`screenBg`, `Screen`-komponenter, `bare`/`showChrome`/`iframeScrollY` — **men `captionSize` skalad −15%**:

```text
Screen 1: 140 → 120
Screen 2: 130 → 112
Screen 3: 130 → 112
Screen 4: 130 → 112
Screen 5: 130 → 112
Screen 6: 120 → 104
Screen 7: 120 → 104
```

### 4. Routes

**Fil:** `src/App.tsx` — lägg till bredvid app-store-routerna:

```tsx
<Route path="/export/google-play" element={<Navigate to="/export/google-play/1" replace />} />
<Route path="/export/google-play/:n" element={<GooglePlayScreenshot />} />
```

### 5. Export-pipeline

`exportNodeToPng(node, filename, 1080, 1920)`. `?raw=1`-läget fungerar identiskt.

## Filer som skapas/ändras

```text
NEW  src/lib/exportScreenshot/compositionAndroid.tsx
NEW  src/pages/export/GooglePlayScreenshot.tsx
EDIT src/App.tsx                          (+2 rader routes, +1 import)
```

## Inget som ändras

`composition.tsx`, `AppStoreScreenshot.tsx`, alla `Screen{1-7}*.tsx`, demo-data, captions, copy.

## Verifikation efter implementation

1. Navigera till `/export/google-play/1` … `/7`, kontrollera att alla 7 renderar utan layoutfel.
2. Visuell QA: punch-hole syns top-center med hairline-ring mot både mörkblå och terracotta bakgrund; status bar visar `12:00`; nav-pill längst ner.
3. Ladda ner en PNG, verifiera exakt `1080×1920 px`.
4. Bekräfta att `Screen5VvSession` (`showChrome: false`) inte renderar dubbel status bar men behåller punch-hole.
