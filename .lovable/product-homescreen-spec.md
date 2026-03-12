# Product Homescreen — Design Specification v1.0

> Universell mall för alla Bonki-produkters hemskärmar.  
> Varje produkt ska kännas unik men tillhöra samma familj.

---

## 1. Anatomisk struktur

Skärmen har **fem vertikala zoner** i fast ordning:

```
┌─────────────────────────────┐
│  Z1  Navigation (Back)      │  ← BackToLibraryButton
├─────────────────────────────┤
│  Z2  Background Layer       │  ← Illustration(er), z-index: 0
├─────────────────────────────┤
│  Z3  Hero (Titel + Tagline) │  ← Produktnamn + undertext
├─────────────────────────────┤
│  Z4  Category Buttons       │  ← Navigeringsknappar
├─────────────────────────────┤
│  Z5  Footer (Sign-off +     │  ← Italic cue + Dagbok-knapp
│      Diary entrance)        │
└─────────────────────────────┘
```

Allt innehåll renderas i en **centrerad flexbox-kolumn** (z-index: 1) ovanpå bakgrundslagret.

---

## 2. Konfigurerbara variabler per produkt

Varje produkt definierar dessa värden. Inga andra skillnader ska finnas i layouten:

| Variabel | Typ | Exempel (Jag i Mig) |
|---|---|---|
| `ACCENT_COLOR` | hex | `#8A9A10` |
| `title` | string | `Jag i mig` |
| `tagline` | string | `när känslor får ord` |
| `signOff` | string | `Välj det som känns rätt just nu.` |
| `illustrations` | `Illustration[]` | Se §3 |
| `titleFontSize` | clamp-sträng | `clamp(38px, 11vw, 52px)` |
| `titleWhiteSpace` | CSS value | `nowrap` / `normal` |

### Typfall: `ProductManifest`

`product.categories` → knapparna  
`product.id` → diary-länk (`/diary/{id}`)  
Accent-färgen injiceras av `useProductTheme` via `accentColor` i manifestet.

---

## 3. Bakgrundsillustrationer (Z2)

Varje produkt har **1–2 illustrationer** placerade som absolut positionerade, dekorativa element.

### Illustration-schema

```ts
interface Illustration {
  src: string;              // Import-path till bilden
  position: {
    top?: string;           // e.g. '-4%', '7%'
    bottom?: string;        // e.g. '-12%', '2%'
    left?: string;          // e.g. '-42%', '-40%'
    right?: string;         // e.g. '-25%', '-40%'
  };
  size: {
    width: string;          // e.g. '135%', '160%'
    height: string;         // e.g. '125%', '130%'
  };
  objectPosition: string;   // e.g. 'left top', 'right top'
  opacity: number;           // 0.18–0.35
  transform?: string;        // e.g. 'rotate(180deg)', 'rotate(-30deg)'
  delay?: number;            // Framer motion delay (0 för primär, 0.15 för sekundär)
}
```

### Riktlinjer

- **Opacitet**: 0.18–0.35 (läsbarhet > estetik)
- **Overflow**: Illustrationen ska **blöda ut** bortom skärmkanten (negative positioning + >100% width)
- **Pointer events**: Alltid `none`
- **Fade-in**: `opacity: 0 → 1`, duration `0.4s`
- **Max 2 illustrationer** per produkt. Om 2: den sekundära har `delay: 0.15`

### Produktspecifika exempel

| Produkt | Primär placering | Sekundär | Opacitet |
|---|---|---|---|
| Jag i Mig | Vänster-topp, 135% bred | — | 0.35 |
| Jag med Andra | Vänster-topp, 160% bred | Höger-botten, 55% bred, -30° rotation | 0.35 |
| Jag i Världen | Höger-topp, 140% bred, 180° | Vänster-botten, 140% bred | 0.28 |
| Vardag | Höger-topp, 130% bred | — | 0.18 |
| Syskon | Höger-topp, 130% bred | — | 0.18 |
| Sexualitet | Höger-topp, 130% bred | — | 0.22 |

---

## 4. Hero-zon (Z3)

### Titel (H1)

```css
font-family: 'DM Serif Display', var(--font-serif);
font-size: /* produkt-specifik clamp, se §2 */;
font-weight: 700;
color: ACCENT_COLOR;
letter-spacing: -0.01em;
white-space: /* nowrap för korta titlar, normal för 'Jag med andra' */;
```

**Typografisk skala:**
- 1-ord titlar (Vardag, Syskon): `clamp(38px, 11vw, 52px)`
- 2-ord titlar (Jag i mig): `clamp(38px, 11vw, 52px)`
- 3-ord titlar (Jag med andra, Jag i världen): `clamp(34px, 9vw, 48px)`
- Specialfall (Sexualitet): `clamp(34px, 9vw, 48px)`

### Tagline

```css
font-family: var(--font-serif); /* .font-serif class */
font-size: clamp(16px, 4.5vw, 20px);
font-weight: 400;
color: #2C2420;
opacity: 0.8;
margin-top: 8px;
text-shadow: 0px 1px 6px rgba(255,255,255,0.9), 0px 0px 20px rgba(255,255,255,0.4);
```

Text-shadow säkerställer läsbarhet mot illustrationsbakgrunden.

### Spacing

- `margin-bottom: 2vh` under hero-containern

---

## 5. Kategoriknappar (Z4)

### Layout

- **Bredd**: 80% av förälder-containern
- **Min-höjd**: 56px
- **Gap**: `3vh` (styrs av parent container)
- **Centrerade** horisontellt och vertikalt (flexbox)

### Visuell stil

```css
background: var(--product-button-bg, hsla(0, 0%, 100%, 0.92));
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border-radius: var(--product-button-radius);
border: none;
box-shadow: var(--product-button-shadow);
padding: 0 24px;
white-space: normal;
line-height: 1.3;
```

### Knapptext

```css
font-family: 'DM Serif Display', var(--font-serif);
font-size: clamp(18px, 5vw, 24px);
font-weight: 400;
color: ACCENT_COLOR;
```

### Interaktion (Framer Motion)

```ts
whileHover: { scale: 1.04, y: -2 }
whileTap: { scale: 0.97 }
```

### Entrance-animation

Varje knapp använder `pillVariants`:
```ts
hidden: { opacity: 0, y: 20, scale: 0.95 }
visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }
```

Container stagger: `0.1s` per knapp, `0.35s` initial delay.

---

## 6. Footer-zon (Z5)

### Sign-off text

```css
font-family: var(--font-serif);
font-size: clamp(14px, 3.8vw, 16px);
font-style: italic;
color: ACCENT_COLOR;
opacity: 0.65;
text-align: center;
line-height: 1.5;
margin-top: 1vh;
max-width: 85%;
```

Standard-text: *"Välj det som känns rätt just nu."*  
Kan anpassas per produkt om tonen kräver det.

### Dagbok-ingång

Renderas som en glasmorfisk knapp:

```css
background: rgba(255, 255, 255, 0.55);
border: none;
margin-top: 2vh;
padding: 16px 28px;
border-radius: 12px;
box-shadow: 0px 2px 8px rgba(44, 36, 32, 0.06);
width: 70%;
```

**Innehåll:**
- `BookOpen`-ikon (18px, `color: ACCENT_COLOR`, opacity 0.7)
- Titel: *"Vår dagbok"* (DM Serif Display, clamp 17–20px, `color: ACCENT_COLOR`)
- Undertext: *"Era tankar, samlade"* (12px, `#8A8078`, italic)

**Interaktion:**
```ts
whileHover: { scale: 1.02, y: -1 }
whileTap: { scale: 0.98 }
```

**Navigering:** `navigate(`/diary/${product.id}`)`

---

## 7. Container-layout (Z1 content wrapper)

```css
position: relative;
z-index: 1;
min-height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
padding-top: 12vh;
padding-right: 10vw;
padding-bottom: 48px;
padding-left: 10vw;
```

### Inner animated container

```css
display: flex;
flex-direction: column;
align-items: center;
gap: 3vh;
width: 100%;
```

---

## 8. Bakgrundsyta

```css
.min-h-screen.relative.overflow-hidden
background-color: var(--surface-base);
```

`--surface-base` injiceras av `useProductTheme` baserat på produktens `backgroundColor`.

---

## 9. Navigation (BackToLibraryButton)

Placeras i toppen med `color={ACCENT_COLOR}`.
Komponenten renderar sig själv med fast positionering.

---

## 10. Motion-system

### Easing

```ts
const EASE = [0.4, 0.0, 0.2, 1] as const;  // Material Design standard
```

### Container orchestration

```ts
containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } }
}
```

### Element entrance

```ts
pillVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } }
}
```

Alla interaktiva element (knappar, titel, tagline, sign-off, diary) använder `pillVariants`.  
Bakgrundsillustrationer har separat fade-in (ej stagger).

---

## 11. Designprinciper

1. **Färgmonopol**: Varje skärm ägs av en enda `ACCENT_COLOR`. All text, knappar och ikoner svarar mot denna.
2. **Illustration som atmosfär**: Bilder är aldrig fokuspunkt — de skapar stämning via låg opacitet och bleed-out.
3. **Glassmorphism-nivå**: Knappar har 92% vit bakgrund med `blur(16px)` — tillräckligt transparent för att känna illustrationen bakom, men aldrig så att läsbarheten lider.
4. **Vertikal rytm**: `3vh`-gap skapar ett naturligt, andande mellanrum som skalas med enheten.
5. **Inga siffror, inga ikoner på kategorier**: Kategorier presenteras som rena textpills — ordningen kommuniceras implicit via position.
6. **Serif-dominans**: Alla synliga texter utom system-UI använder serif-typsnitt för en editorial premiumkänsla.

---

## 12. Checklista för ny produkt

- [ ] Definiera `ACCENT_COLOR` (hex)
- [ ] Välj/skapa 1–2 illustrationer (PNG, transparent bakgrund)
- [ ] Bestäm illustration-placering (se §3)
- [ ] Skriv `title`, `tagline`, `signOff`
- [ ] Bestäm `titleFontSize` baserat på ordantal
- [ ] Skapa komponent: `{Produkt}ProductHome.tsx`
- [ ] Registrera i `ProductHome.tsx` switch
- [ ] Verifiera mot `useProductTheme` (accent + bg injiceras korrekt)
- [ ] Testa med `/?devState=solo` att layouten andas rätt
- [ ] Kontrollera att illustration-opacitet inte stör textläsbarhet
