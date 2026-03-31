

## Fix 3 Content Misses in jag-i-mig.ts

Three surgical text replacements. No structural or ID changes.

### Changes

**1. Line 334** — `jim-avundsjuk` subtitle
```
'Att vilja ha det någon annan har — och vad det handlar om'
→ 'Att vilja ha det någon annan har'
```

**2. Line 347** — `jim-avundsjuk` prompt 5
```
'Har du känt dig avundsjuk ibland, även om vuxna sagt att allt är rättvist? Hur kändes det?'
→ 'Har du känt dig avundsjuk någon gång, även om en vuxen sa att det var rättvist? Vad hände då?'
```

**3. Line 326** — `jim-stress` prompt 7 (last)
```
'Känner du någon som ibland pratar om att den är stressad? Vad tror du gör den stressad?'
→ 'Är det skillnad på att vara stressad och att ha bråttom? Kan du ge ett exempel på när du kan känna dig stressad utan att ha bråttom?'
```

### Verification
- `jim-avundsjuk` prompt count stays at 7
- `jim-stress` prompt count stays at 7
- No other files touched
- No protected patterns affected

