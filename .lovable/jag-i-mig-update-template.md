# Jag i Mig — Content Update Template

> Fill in this file and hand it back. I will apply changes mechanically to `src/data/products/jag-i-mig.ts`.
> Only edit fields marked ✏️. Do NOT change anything marked 🔒.

---

## 🔒 LOCKED IDENTIFIERS — Do not change

```
Product ID:    jag_i_mig
Product slug:  jag-i-mig
freeCardId:    jim-glad
```

---

## Product Metadata

```
name:               ✏️ Jag i Mig
tagline:            ✏️ När känslor får ord.
description:        ✏️ Utforska känslor inifrån och ut
headerTitle:        ✏️ Inifrån & ut
paywallDescription: ✏️ Lås upp alla samtal om känslor, mod och att förstå sig själv.
pronounMode:        🔒 du
ageLabel:           ✏️ (currently undefined)
```

## Colors

```
accentColor:      ✏️ hsl(178, 26%, 30%)
accentColorMuted: ✏️ hsl(178, 20%, 82%)
secondaryAccent:  ✏️ hsl(178, 26%, 30%)
backgroundColor:  ✏️ #115D57
ctaButtonColor:   ✏️ #27A69C
tileLight:        ✏️ #27A69C
tileMid:          ✏️ #1D8A82
tileDeep:         ✏️ #115D57
```

---

## Categories

### CATEGORY: 🔒 jim-mina-kanslor

```
title:       ✏️ Mina känslor
subtitle:    ✏️ De känslor som finns i dig – och hur de känns.
description: ✏️ Grundläggande känslor och hur de känns
cardCount:   ⚠️ 7  ← MUST equal actual number of cards with this categoryId
```

### CATEGORY: 🔒 jim-starka-kanslor

```
title:       ✏️ Starka känslor
subtitle:    ✏️ Svåra känslor som är jobbiga – men viktiga att förstå.
description: ✏️ Svårare känslor att förstå och hantera
cardCount:   ⚠️ 7  ← MUST equal actual number of cards with this categoryId
```

### CATEGORY: 🔒 jim-stora-kanslor

```
title:       ✏️ Stora känslor
subtitle:    ✏️ Vem du är när allt hänger ihop.
description: ✏️ Att förstå sig själv som en hel person
cardCount:   ⚠️ 7  ← MUST equal actual number of cards with this categoryId
```

### NEW CATEGORY (optional — copy this block)

```
id:          🔒 jim-________  ← must start with jim-, must be unique
title:       ✏️
subtitle:    ✏️
description: ✏️
cardCount:   ⚠️ ← MUST equal actual number of cards with this categoryId
```

---

## Cards

### K1: Mina känslor

---

#### CARD: 🔒 jim-trygg

```
title:      ✏️ Trygg
subtitle:   ✏️ Vad som gör att en känner sig säker och omhändertagen
categoryId: 🔒 jim-mina-kanslor
prompts:
  1. ✏️ Hur känns det att vara trygg?
  2. ✏️ Varför är det viktigt att känna sig trygg?
  3. ✏️ Hur får du någon annan att känna sig trygg?
  4. ✏️ Berätta om när du känner dig trygg. Vad eller vem hjälper dig att känna dig trygg?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-glad

```
title:      ✏️ Glad
subtitle:   ✏️ Vad som ger energi och glädje – och hur en delar det
categoryId: 🔒 jim-mina-kanslor
prompts:
  1. ✏️ Hur känns det i kroppen att vara glad?
  2. ✏️ Vad vill du göra när du är glad?
  3. ✏️ När kan du bli glad för någon annans skull?
  4. ✏️ Har du någon gång låtsats vara glad fast du egentligen inte var det? Varför tror du att en gör så?
  5. ✏️ Kan du bli glad av andras skratt?
  6. ✏️ Hur kan du göra någon annan glad?
  7. ✏️ När blev du senast riktigt glad för något?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-ledsen

```
title:      ✏️ Ledsen
subtitle:   ✏️ Att ha det tungt – och hur en kan bära det tillsammans
categoryId: 🔒 jim-mina-kanslor
prompts:
  1. ✏️ Hur känns det i kroppen att vara ledsen?
  2. ✏️ Vad vill du göra när du är ledsen?
  3. ✏️ Kan du vara glad och ledsen på samma gång?
  4. ✏️ Kan du bli ledsen för någon annans skull? Hur känns det?
  5. ✏️ Hur kan du trösta någon som är ledsen?
  6. ✏️ Vad vill du att andra ska göra eller säga när du är ledsen?
  7. ✏️ Vad tror du kan göra en vuxen ledsen?
  8. ✏️ Berätta vad som gör dig ledsen.
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-arg

```
title:      ✏️ Arg
subtitle:   ✏️ Ilska är en signal – vad väcker den och vart tar den vägen?
categoryId: 🔒 jim-mina-kanslor
prompts:
  1. ✏️ Hur känns det i kroppen att vara arg?
  2. ✏️ Vad gör dig arg?
  3. ✏️ Vad vill du göra när du är riktigt arg?
  4. ✏️ Vad vill du att andra ska göra eller säga när du är arg?
  5. ✏️ Tror du att barn och vuxna kan bli lika arga? Vad är lika och vad är annorlunda?
  6. ✏️ Hur känns det när någon annan är arg på dig?
  7. ✏️ Om du fick vara så arg du bara kan, vad skulle du göra då? Hur ser du ut?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-radd

```
title:      ✏️ Rädd
subtitle:   ✏️ Vad som skrämmer oss och hur vi kan känna oss tryggare
categoryId: 🔒 jim-mina-kanslor
prompts:
  1. ✏️ Hur känns det i kroppen att vara rädd?
  2. ✏️ Vad kan du göra när något eller någon skrämmer dig?
  3. ✏️ Vad vill du att andra ska göra när du är rädd?
  4. ✏️ Kan en vara rädd för något en inte kan se? Hur kan det vara så?
  5. ✏️ Vet du något som skrämmer någon annan men som du inte är rädd för?
  6. ✏️ Vad är du rädd för?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-nyfiken

```
title:      ✏️ Nyfiken
subtitle:   ✏️ Lusten att lära sig mer – och vad som händer när nyfikenheten tar över
categoryId: 🔒 jim-mina-kanslor
prompts:
  1. ✏️ Hur känns det i kroppen att vara nyfiken?
  2. ✏️ Vad vill du göra när du är nyfiken?
  3. ✏️ Vad kan vara bra med att vara nyfiken?
  4. ✏️ När kan du hamna i trubbel av att vara nyfiken?
  5. ✏️ Varför tror du att människor vill veta så mycket?
  6. ✏️ Vad önskar du att du visste mer om?
  7. ✏️ Om du visste var din födelsedagspresent var gömd, skulle du gå och titta på den? Varför? Varför inte?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-forvanad

```
title:      ✏️ Förvånad
subtitle:   ✏️ Känslan när något oväntat händer – bra eller dåligt
categoryId: 🔒 jim-mina-kanslor
prompts:
  1. ✏️ Hur ser du ut när du är förvånad?
  2. ✏️ Varför kan det vara kul att bli förvånad?
  3. ✏️ Vad gör du när du blir förvånad?
  4. ✏️ Vad kan du göra för att överraska någon?
  5. ✏️ Vad kan vara skillnaden mellan en bra och en dålig överraskning?
  6. ✏️ Berätta om en gång då du blev förvånad.
  + (add new prompts here)
```

---

### K2: Starka känslor

---

#### CARD: 🔒 jim-acklad

```
title:      ✏️ Äcklad
subtitle:   ✏️ Känslan av avsmak – varför den finns och vad den skyddar oss från
categoryId: 🔒 jim-starka-kanslor
prompts:
  1. ✏️ Hur ser du ut när du känner äckel?
  2. ✏️ Varför tror du att vi känner äckel eller avsmak för saker?
  3. ✏️ Vad är det äckligaste du vet?
  4. ✏️ Vad vill du göra när du känner äckel?
  5. ✏️ Varför kan olika personer tycka att olika saker är äckliga?
  6. ✏️ När kände du dig senast äcklad och vad gjorde du då?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-skam

```
title:      ✏️ Skam
subtitle:   ✏️ Känslan av att ha gjort fel – eller tro att en själv är fel
categoryId: 🔒 jim-starka-kanslor
prompts:
  1. ✏️ Hur känns det i kroppen när du skäms?
  2. ✏️ Varför tror du att människor skäms?
  3. ✏️ Vad kan du skämmas över? Vad vill du göra då?
  4. ✏️ Vad kan du göra för att skämmas mindre?
  5. ✏️ Är det lätt eller svårt att berätta för någon att du skäms? Varför tror du det är så?
  6. ✏️ Om du vill, berätta om en gång du känt dig skamsen.
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-avsky

```
title:      ✏️ Avsky
subtitle:   ✏️ En stark känsla av motvilja – mot saker, situationer eller beteenden
categoryId: 🔒 jim-starka-kanslor
prompts:
  1. ✏️ Hur känns avsky?
  2. ✏️ Hur ser du ut när du känner avsky?
  3. ✏️ Varför tror du att människor känner avsky?
  4. ✏️ Varför tror du att avsky ibland kan vara ett jobbigt eller obehagligt sätt att känna?
  5. ✏️ Hur kan du göra för att känna mindre avsky?
  6. ✏️ Har du känt avsky mot något? Vad var det och vad gjorde du?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-avundsjuk

```
title:      ✏️ Avundsjuk
subtitle:   ✏️ Att vilja ha det någon annan har – och vad det egentligen handlar om
categoryId: 🔒 jim-starka-kanslor
prompts:
  1. ✏️ Hur känns avundsjuka?
  2. ✏️ Varför tror du att människor känner avundsjuka?
  3. ✏️ Vad kan du bli avundsjuk på?
  4. ✏️ Varför kan det kännas viktigt att ha det som andra har?
  5. ✏️ Har du känt dig avundsjuk ibland, även om vuxna sagt att allt är rättvist? Hur kändes det då?
  6. ✏️ Vad tror du vuxna kan vara avundsjuka på?
  7. ✏️ Hur kan du tänka för att känna dig mindre avundsjuk?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-svartsjuk

```
title:      ✏️ Svartsjuk
subtitle:   ✏️ Rädslan att förlora någons kärlek eller uppmärksamhet till någon annan
categoryId: 🔒 jim-starka-kanslor
prompts:
  1. ✏️ Hur skiljer sig svartsjuka från avundsjuka?
  2. ✏️ Hur känns det att vara svartsjuk?
  3. ✏️ Varför tror du att människor känner svartsjuka?
  4. ✏️ Har du varit svartsjuk någon gång? Vad gjorde du då?
  5. ✏️ När kan det bli problem av att känna svartsjuka?
  6. ✏️ Hur kan en dela på en persons uppmärksamhet och kärlek med andra? Vad hjälper dig att känna dig trygg ändå?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-besviken

```
title:      ✏️ Besviken
subtitle:   ✏️ När något inte blev som en hoppades – och hur det skiljer sig från ilska
categoryId: 🔒 jim-starka-kanslor
prompts:
  1. ✏️ Vad betyder det att vara besviken? Är det annorlunda från att vara arg?
  2. ✏️ Hur ser du ut när du är besviken? Hur ser dina vuxna ut?
  3. ✏️ Har en vuxen eller kompis någon gång berättat att de var besvikna på dig? Hur kändes det?
  4. ✏️ Vad kan du göra när någon är besviken på dig?
  5. ✏️ Har du någon gång blivit besviken på någon eller något? Vad hände?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-utanfor

```
title:      ✏️ Utanför
subtitle:   ✏️ Att inte få vara med – och vad vi kan göra åt det
categoryId: 🔒 jim-starka-kanslor
prompts:
  1. ✏️ Hur känns det att inte få vara med?
  2. ✏️ Varför tror du att det är viktigt att känna att en får vara med?
  3. ✏️ Vad kan du göra för att ingen annan ska känna sig utanför?
  4. ✏️ Måste en leka med någon som behandlar en dåligt? Varför eller varför inte?
  5. ✏️ Hur kan du förklara varför någon inte fick vara med i leken?
  6. ✏️ Hur kan du leka med någon även om ni tycker olika saker är kul?
  7. ✏️ När har du känt dig utanför och vad gjorde du då?
  + (add new prompts here)
```

---

### K3: Stora känslor

---

#### CARD: 🔒 jim-karlek

```
title:      ✏️ Kärlek
subtitle:   ✏️ Alla de olika sätten vi kan älska och bry oss om varandra
categoryId: 🔒 jim-stora-kanslor
prompts:
  1. ✏️ Hur känns det att vara älskad?
  2. ✏️ Hur kan du visa kärlek och att du tycker om någon utan ord?
  3. ✏️ Hur kan kärlek se ut mellan olika människor?
  4. ✏️ Kan du känna olika sorters kärlek?
  5. ✏️ Är det samma sak att älska ett husdjur som att älska en person?
  6. ✏️ Berätta om någon eller något du älskar.
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-stolt

```
title:      ✏️ Stolt
subtitle:   ✏️ Känslan av att ha gjort något som känns riktigt bra
categoryId: 🔒 jim-stora-kanslor
prompts:
  1. ✏️ Hur ser du ut när du är stolt?
  2. ✏️ Vad kan människor vara stolta över?
  3. ✏️ Vad vill du göra när du är stolt?
  4. ✏️ När kan du vara stolt över någon annan?
  5. ✏️ Vad tror du vuxna känner sig stolta över?
  6. ✏️ Berätta om en gång då du känt dig stolt.
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-vild

```
title:      ✏️ Vild
subtitle:   ✏️ Den lössläppta, livfulla energin som vill ta plats
categoryId: 🔒 jim-stora-kanslor
prompts:
  1. ✏️ Hur känns det i kroppen att vara vild?
  2. ✏️ När känner du dig vild?
  3. ✏️ Kan du känna dig vild på olika sätt?
  4. ✏️ Tror du att vuxna kan känna sig vilda på samma sätt som barn?
  5. ✏️ Varför tror du att vuxna ibland ber barn att vara mindre vilda?
  6. ✏️ Hur känns det för dig när någon annan är riktigt vild?
  7. ✏️ Om du fick vara riktigt vild en dag, vad skulle du göra då?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-jag

```
title:      ✏️ Jag
subtitle:   ✏️ En stund att stanna upp och reflektera över hur en mår just nu
categoryId: 🔒 jim-stora-kanslor
prompts:
  1. ✏️ Hur mår du just nu, på riktigt?
  2. ✏️ Vad är det bästa med dig?
  3. ✏️ Vilken känsla gillar du mest?
  4. ✏️ Om en vän skulle beskriva dig, vad tror du den personen skulle säga?
  5. ✏️ Om du fick dela en känsla med någon du litar på, vilken känsla skulle det vara – och vem skulle du dela den med?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-bestamd

```
title:      ✏️ Bestämd
subtitle:   ✏️ Att veta vad en vill och våga stå för det
categoryId: 🔒 jim-stora-kanslor
prompts:
  1. ✏️ Hur ser du ut när du är bestämd?
  2. ✏️ Hur vet du att du är bestämd? Hur känns det?
  3. ✏️ Varför är det viktigt att kunna vara bestämd?
  4. ✏️ Finns det tillfällen när det kan vara bra att lyssna mer på andra och vara mer flexibel? Berätta.
  5. ✏️ Vet du någon som ofta är bestämd?
  6. ✏️ Berätta om en gång när du var bestämd.
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-stress

```
title:      ✏️ Stress
subtitle:   ✏️ Känslan av för mycket på en gång – i kroppen och i vardagen
categoryId: 🔒 jim-stora-kanslor
prompts:
  1. ✏️ Varför tror du att människor blir stressade?
  2. ✏️ Har du någon gång känt dig stressad?
  3. ✏️ Hur känns stress i kroppen?
  4. ✏️ Vad brukar hjälpa dig när du känner dig stressad? Och hur kan en hjälpa en kompis som verkar stressad?
  5. ✏️ Hur kan det bli problem av att känna för mycket stress?
  6. ✏️ Vad kan barn känna sig stressade över? Är det annorlunda för vuxna, tror du?
  7. ✏️ Känner du någon som ibland pratar om att de är stressade? Vad tror du gör dem stressade?
  + (add new prompts here)
```

---

#### CARD: 🔒 jim-ensam

```
title:      ✏️ Ensam
subtitle:   ✏️ Skillnaden mellan att vara för sig själv och att känna sig övergiven
categoryId: 🔒 jim-stora-kanslor
prompts:
  1. ✏️ Hur känns det att vara ensam?
  2. ✏️ Varför tror du att du ibland kan känna dig ensam?
  3. ✏️ Vad kan du göra när du inte vill vara ensam?
  4. ✏️ Varför är det ibland skönt att vara ensam?
  5. ✏️ Vad tror du är skillnaden mellan att vilja vara ensam och att känna sig ensam? Hur vet du skillnaden?
  6. ✏️ När har du känt dig ensam och vad gjorde du då?
  + (add new prompts here)
```

---

### NEW CARD (copy this block for each new card)

```
id:         🔒 jim-________  ← must start with jim-, must be unique across ALL products
title:      ✏️
subtitle:   ✏️
categoryId: 🔒 jim-________  ← must match an existing or new category ID
prompts:
  1. ✏️
  + (add more)
```

---

## ✅ Validation Checklist (before handing back)

- [ ] Every card's `categoryId` matches an existing category `id`
- [ ] Every category's `cardCount` equals the actual number of cards assigned to it
- [ ] No existing card ID was renamed or removed
- [ ] No existing category ID was renamed or removed
- [ ] New card IDs use `jim-` prefix and are unique across all products
- [ ] `freeCardId` still points to a valid card ID (`jim-glad` unless intentionally changed)
- [ ] No duplicate card IDs
- [ ] No duplicate category IDs
