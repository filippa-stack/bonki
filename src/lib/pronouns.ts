/**
 * Pronoun-adapted UI text for products.
 * 'ni' = couple (Still Us), 'du' = solo (Jag i Mig, etc.)
 */

export type PronounMode = 'du' | 'ni';

const COMPLETION_MESSAGES_NI = [
  'Det här samtalet tillhör er.',
  'Ni tog er tid för varandra.',
  'Det ni just gjorde betyder något.',
  'Varje samtal är ett val. Ni valde rätt.',
  'Ni var här. Helt och hållet.',
  'Tack för att ni stannade kvar.',
  'Ni valde varandra igen.',
  'Det här var bara för er.',
  'Ni gav varandra hela rummet.',
  'Det här är hur ni växer.',
];

const COMPLETION_MESSAGES_DU = [
  'Det här samtalet tillhör dig.',
  'Du tog dig tid.',
  'Det du just gjorde betyder något.',
  'Varje samtal är ett val. Du valde rätt.',
  'Du var här. Helt och hållet.',
  'Tack för att du stannade kvar.',
  'Du valde dig själv igen.',
  'Det här var bara för dig.',
  'Du gav dig själv hela rummet.',
  'Det här är hur du växer.',
];

export function getCompletionMessages(mode: PronounMode): string[] {
  return mode === 'du' ? COMPLETION_MESSAGES_DU : COMPLETION_MESSAGES_NI;
}

/**
 * Common UI strings adapted per pronoun mode.
 */
export function getUIText(mode: PronounMode) {
  if (mode === 'du') {
    return {
      readAloud: 'Läs frågorna högt för dig själv.',
      talkTogether: 'Fundera på frågorna i lugn och ro.',
      notekeeper: 'Anteckna det du vill minnas.',
      readyButton: 'Jag är redo',
      safetyNote: 'Inget av det du skriver lämnar det här rummet.',
      takeawayPlaceholder: 'Skriv något du vill bära med dig.',
      takeawayPrompt: 'Finns det något du vill komma ihåg?',
      seeNotes: 'Se alla dina anteckningar',
      allExplored: 'Du har utforskat allt. För nu.',
      allExploredSub: 'Korten öppnar sig igen när du är redo.',
      leaveConfirmDesc: 'Dina svar sparas.',
      stalePrompt: 'Det verkar som att ett tidigare samtal inte avslutades. Vill du fortsätta det eller börja om?',
      sessionEnded: 'Din session avslutades. Du kan fortsätta härifrån.',
      archiveTitle: 'Dina samtal',
      noSession: 'Ingen tidigare session hittades.',
      ritualHints: {
        opening:    { together: 'Det finns inget rätt svar här. Bara ditt.',  solo: 'Det finns inget rätt svar här. Bara ditt.' },
        reflective: { together: 'Ta tid på dig innan du svarar.',           solo: 'Ta tid på dig innan du svarar.' },
        scenario:   { together: 'Välj ett perspektiv — inte en skyldig.',    solo: 'Välj ett perspektiv — inte en skyldig.' },
        exercise:   { together: 'Gör en liten sak du faktiskt kan hålla.',   solo: 'Gör en liten sak du faktiskt kan hålla.' },
      },
    };
  }
  return {
    readAloud: 'Läs frågorna högt för varandra.',
    talkTogether: 'Prata om frågorna tillsammans.',
    notekeeper: 'En av er antecknar det ni vill minnas.',
    readyButton: 'Vi är redo',
    safetyNote: 'Inget av det ni delar lämnar det här rummet.',
    takeawayPlaceholder: 'Skriv något ni vill bära med er.',
    takeawayPrompt: 'Finns det något ni vill komma ihåg?',
    seeNotes: 'Se alla era anteckningar',
    allExplored: 'Ni har utforskat allt. För nu.',
    allExploredSub: 'Korten öppnar sig igen när ni är redo.',
    leaveConfirmDesc: 'Era svar sparas.',
    stalePrompt: 'Det verkar som att ett tidigare samtal inte avslutades. Vill ni fortsätta det eller börja om?',
    sessionEnded: 'Din session avslutades. Ni kan fortsätta härifrån.',
    archiveTitle: 'Era samtal',
    noSession: 'Ingen tidigare session hittades.',
    ritualHints: {
      opening:    { together: 'Det finns inget rätt svar här. Bara ert.',  solo: 'Det finns inget rätt svar här. Bara ditt.' },
      reflective: { together: 'Lyssna färdigt innan ni svarar.',          solo: 'Ta tid på dig innan du svarar.' },
      scenario:   { together: 'Välj ett perspektiv — inte en skyldig.',   solo: 'Välj ett perspektiv — inte en skyldig.' },
      exercise:   { together: 'Gör en liten sak ni faktiskt kan hålla.',  solo: 'Gör en liten sak du faktiskt kan hålla.' },
    },
  };
}
