
# Välkomstskärm för nyligen ansluten partner

## Vad som ändras

När Partner B (eller en ny partner) landar på startsidan och det gemensamma utrymmet saknar delade reflektioner och samtalshistorik, visas en välkomstskärm istället för den vanliga (tomma) startsidan. Om det redan finns aktivitet visas startsidan som vanligt.

## Vad som INTE ändras
- Navigation och routes
- Datamodeller
- Befintliga komponenter byggs inte om
- Design tokens (färger, typsnitt)

## Implementationsdetaljer

### 1. Ny komponent: `WelcomePartner.tsx`

En enkel, emotionell välkomstskärm med:
- Logotyp
- Rubrik: t.ex. "Välkommen till ert gemensamma rum"
- Kort text som förklarar att det här är ett utrymme för samtal och reflektioner tillsammans
- **Primär knapp**: "Starta ert första samtal" -- navigerar till det rekommenderade startkortet (`/card/listening-presence`, dvs. det första kortet i första kategorin)
- **Sekundär länk**: "Utforska samtalsområden" -- scrollar/navigerar till den vanliga startsidan

### 2. Ändringar i `src/pages/Index.tsx`

Logik för att avgöra om välkomstskärmen ska visas:
- Kontrollera om `useCoupleSpace()` returnerar `userRole === 'partner_b'`
- Kontrollera om det saknas samtalshistorik (`savedConversations.length === 0`) och inga delade reflektioner (`getAllSharedNotes()` är tomt) och inga utforskade kort (`journeyState?.exploredCardIds` är tomt eller saknas)
- Om båda villkoren uppfylls: visa `WelcomePartner` istället för `Home`
- Om användaren klickar "Utforska samtalsområden" eller avfärdar välkomsten, visa `Home` som vanligt (via lokal state `dismissed`)

### 3. Nya översättningsnycklar i `src/i18n/sv.json`

Läggs till under en ny `"welcome_partner"` sektion:
- `title`: "Välkommen till ert gemensamma rum"
- `description`: "Det här är ett utrymme för samtal och reflektioner — för er, i er egen takt."
- `start_first`: "Starta ert första samtal"
- `explore`: "Utforska samtalsområden"

### Flöde

```text
Partner B loggar in -> JoinSpace -> redirect till /
                                        |
                              Index.tsx kollar:
                              - role === partner_b?
                              - inga samtal/reflektioner?
                                        |
                          JA: WelcomePartner visas
                          NEJ: Home visas som vanligt
```

Primärknappen navigerar till `/card/listening-presence` (första kortet). Sekundärknappen sätter `dismissed = true` och visar Home.
