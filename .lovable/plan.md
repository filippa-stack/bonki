# Bonki Multi-Product App — Implementeringsplan

## Övergripande mål
Appen ska bli en "Bonki-app" med ett produktbibliotek där användare kan köpa och låsa upp olika kortlekar (produkter). Still Us är den första produkten — 6 till ska läggas till med samma struktur.

## Grundprincip: Feature-flagga
Biblioteksvyn aktiveras INTE för slutanvändare förrän vi explicit slår på den.
- Befintlig routing (`/` → Still Us) fortsätter fungera som idag
- Biblioteket byggs på en separat route (`/library` eller via `?view=library`)
- Publiceringar påverkar bara Still Us tills vi är redo

---

## Fas 1: Datamodell & Content-arkitektur

### 1.1 Utöka products-tabellen
- Lägg till kolumner: `description`, `tagline`, `price_sek`, `icon_emoji`, `color_accent`, `sort_order`, `content_version`
- Infoga de 6 nya produkterna (med namn och metadata)

### 1.2 Content-filstruktur
- Flytta nuvarande `src/data/content.ts` → `src/data/products/still-us.ts`
- Skapa `src/data/products/index.ts` som exporterar alla produkter
- Skapa en content-fil per produkt (samma struktur: kategorier → kort → sektioner → prompts)
- Behåll bakåtkompatibilitet: `src/data/content.ts` re-exporterar still-us för att inte bryta befintlig kod

### 1.3 Typsystem
- Skapa `src/types/product.ts` med `ProductManifest`-typ (id, namn, slug, content, metadata)
- Säkerställ att alla content-filer följer samma interface

---

## Fas 2: Routing & produktkontext

### 2.1 ProductContext
- Ny context: `ProductProvider` som håller vald produkt-ID
- Alla befintliga hooks (useApp, useNormalizedSession etc.) läser `productId` från context
- Default: `still_us` om ingen produkt är vald (bakåtkompatibelt)

### 2.2 Routing-uppdatering
- Ny route: `/product/:productId` → Produktens startsida (Home)
- Ny route: `/product/:productId/category/:categoryId`
- Ny route: `/product/:productId/card/:cardId`
- Befintliga routes (`/`, `/category/:id`, `/card/:id`) fortsätter fungera och antar `still_us`
- Ingen breaking change för befintliga användare

### 2.3 Biblioteksvy (feature-flaggad)
- Ny komponent: `ProductLibrary.tsx`
- Tiles med produkter, köpstatus, elegant design
- Aktiveras via `?view=library` eller en framtida config-toggle
- Ska inte vara synlig i produktion förrän vi bestämmer oss

---

## Fas 3: Köpflöde per produkt

### 3.1 Utökad PurchaseScreen
- Nuvarande PurchaseScreen generaliseras: tar emot `productId` och visar rätt pris/namn
- Stripe-integration per produkt (engångsköp)
- `user_product_access` används för att spåra vilka produkter en användare har

### 3.2 Onboarding per produkt
- Varje produkt kan ha sin egen onboarding-sekvens (eller dela en generisk)
- Still Us behåller sin befintliga onboarding
- Nya produkter får en kortare "produktintro" (2-3 slides)

---

## Fas 4: Biblioteksvyn live

### 4.1 Byt default-route
- `/` → ProductLibrary (biblioteket)
- Still Us nås via `/product/still_us`
- Användare som redan har Still Us landar direkt i biblioteket

### 4.2 Polish
- Animationer, övergångar mellan bibliotek och produkt
- Sökning/filtrering om det blir många produkter
- Badges: "Ny", "Populär", etc.

---

## Nuvarande status
- [ ] Fas 1: Datamodell & Content — INTE PÅBÖRJAD
- [ ] Fas 2: Routing & produktkontext — INTE PÅBÖRJAD
- [ ] Fas 3: Köpflöde — INTE PÅBÖRJAD
- [ ] Fas 4: Bibliotek live — INTE PÅBÖRJAD

## Viktigt
- Still Us får INTE påverkas av pågående arbete
- Alla nya routes är additiva (inga breaking changes)
- Publiceringar under byggtiden påverkar bara Still Us
- Content-filer för nya produkter kan fyllas i parallellt
