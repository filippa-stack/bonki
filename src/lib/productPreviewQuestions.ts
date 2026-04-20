/** Handpicked preview question per product — shown on intro and buy pages as proof-of-craft.
 *  Chosen for the "parent doesn't know their child's answer and desperately wants to" frame:
 *  questions that signal the deck goes where their own questions can't.
 *
 *  Used by:
 *  - src/components/ProductIntro.tsx (in-app flow)
 *  - src/pages/BuyPage.tsx (website flow)
 *
 *  Both surfaces must show the same question per product to preserve trust.
 */
export const PREVIEW_QUESTION: Record<string, string> = {
  jag_i_mig: 'Har du någon gång låtsats vara glad fast du egentligen inte var det? Varför tror du att vi gör så?',
  jag_med_andra: 'Har någon annan tyckt att du borde skämmas för något som du själv inte känner är fel?',
  jag_i_varlden: 'Om en vän berättade att de ibland inte orkar eller att livet känns för tungt — vad skulle du göra? Vem skulle du kontakta?',
  syskonkort: 'Vad tror du att ditt syskon tycker är det svåraste med att vara syskon till dig?',
  vardagskort: 'Vad tänker du på precis innan du somnar eller när du precis vaknat?',
  sexualitetskort: 'När kan det vara svårt att säga nej?',
  still_us: 'Om något litet mellan er tyst försvann, vad tror du att du skulle märka först?',
};
