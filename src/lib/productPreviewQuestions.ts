/** Handpicked preview questions per product — shown on intro and buy pages.
 *  Each product exposes 2–3 questions spanning emotional range (lighter,
 *  harder, introspective) so the user gets a felt sense of the deck's variety.
 *
 *  Used by:
 *  - src/components/ProductIntro.tsx (in-app intro stack)
 *  - src/components/ProductIntroMock.tsx (sandbox mirror)
 *  - src/pages/BuyPage.tsx (website flow — renders [0] only)
 */
export const PREVIEW_QUESTIONS: Record<string, string[]> = {
  jag_i_mig: [
    'Har du någon gång låtsats vara glad fast du egentligen inte var det? Varför tror du att vi gör så?',
    'När känner du dig som mest dig själv?',
    'Finns det något du tänker på men aldrig säger högt?',
  ],
  jag_med_andra: [
    'Har någon annan tyckt att du borde skämmas för något som du själv inte känner är fel?',
    'När är det svårast att vara en bra vän?',
    'Vem skulle du vilja stå närmare än du gör idag?',
  ],
  jag_i_varlden: [
    'Om en vän berättade att de ibland inte orkar eller att livet känns för tungt — vad skulle du göra? Vem skulle du kontakta?',
    'Vad i världen just nu gör dig mest hoppfull?',
    'Vilken vuxen tror du förstår dig bäst — och varför?',
  ],
  syskonkort: [
    'Vad tror du att ditt syskon tycker är det svåraste med att vara syskon till dig?',
    'När var ni som närmast varandra?',
    'Vad önskar du att ni gjorde mer av tillsammans?',
  ],
  vardagskort: [
    'Vad tänker du på precis innan du somnar eller när du precis vaknat?',
    'Vad i vår vardag skulle du sakna mest om det försvann?',
    'Finns det något smått som gjort dig glad den här veckan?',
  ],
  sexualitetskort: [
    'När kan det vara svårt att säga nej?',
    'Vad önskar du att fler vuxna pratade om?',
    'Vad betyder det att respektera någon annans gränser?',
  ],
  still_us: [
    'Finns det något litet din partner gör — som alltid får dig att må lite bättre?',
    'Vad är det din partner förstår om dig — som du aldrig behövt förklara?',
    'Finns det något mellan er som fungerar så bra att ni aldrig pratar om det?',
    'Vad skulle din partner bli överraskad av att höra — om du berättade vad du just tänkte?',
  ],
};

/** Backwards-compatible single-question accessor for surfaces that only show one. */
export const PREVIEW_QUESTION: Record<string, string> = Object.fromEntries(
  Object.entries(PREVIEW_QUESTIONS).map(([k, arr]) => [k, arr[0]]),
);
