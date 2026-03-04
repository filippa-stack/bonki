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

/**
 * Age-adapted completion messages.
 * Young children (3+/6+) get simpler, warmer language.
 * Teens (12+/13+) get slightly more mature phrasing.
 */
const COMPLETION_MESSAGES_YOUNG: string[] = [
  'Bra pratat!',
  'Tänk vad mycket du kan!',
  'Det där var viktigt att prata om.',
  'Du är modig som berättar.',
  'Vad fint att ni pratade om det här.',
  'Ni lyssnade på varandra. Det är stort.',
  'Vilken bra fråga du ställde!',
  'Tänk vad bra ni är på att prata.',
  'Det var modigt.',
  'Ni gjorde det tillsammans.',
];

const COMPLETION_MESSAGES_TWEEN: string[] = [
  'Bra pratat.',
  'Det ni just gjorde betyder något.',
  'Tack för att du tog dig tid.',
  'Det här samtalet var viktigt.',
  'Ni vågade prata om det på riktigt.',
  'Bra att ni lyssnade på varandra.',
  'Det du sa var modigt.',
  'Ni tog er tid. Det märks.',
  'Det ni pratade om stannar kvar.',
  'Starkt jobbat.',
];

const COMPLETION_MESSAGES_TEEN: string[] = [
  'Bra att du tog dig tid för det här.',
  'Det du just reflekterade över spelar roll.',
  'Tack för att du stannade kvar i samtalet.',
  'Det här var ditt. Ingen annans.',
  'Du vågade tänka efter på riktigt.',
  'Det tar mod att vara ärlig med sig själv.',
  'Du gav dig själv utrymme. Det är starkt.',
  'Varje samtal gör skillnad.',
  'Det du kände just nu är värt att komma ihåg.',
  'Du tog det på allvar. Det syns.',
];

export type AgeGroup = 'young' | 'tween' | 'teen' | 'adult';

/** Map an ageLabel string to a semantic age group */
export function getAgeGroup(ageLabel?: string): AgeGroup {
  if (!ageLabel) return 'adult';
  const num = parseInt(ageLabel.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return 'adult';
  if (num <= 5) return 'young';   // 3+
  if (num <= 11) return 'tween';  // 6+
  if (num <= 15) return 'teen';   // 12+, 13+
  return 'adult';
}

export function getCompletionMessages(mode: PronounMode, ageLabel?: string): string[] {
  const age = getAgeGroup(ageLabel);
  switch (age) {
    case 'young': return COMPLETION_MESSAGES_YOUNG;
    case 'tween': return COMPLETION_MESSAGES_TWEEN;
    case 'teen': return COMPLETION_MESSAGES_TEEN;
    default: return mode === 'du' ? COMPLETION_MESSAGES_DU : COMPLETION_MESSAGES_NI;
  }
}

/**
 * Common UI strings adapted per pronoun mode.
 */
export function getUIText(mode: PronounMode) {
  if (mode === 'du') {
    return {
      readAloud: 'Läs frågorna högt tillsammans.',
      talkTogether: 'Fundera på frågorna i lugn och ro.',
      notekeeper: 'Ta den tid ni behöver.',
      readyButton: 'Vi börjar',
      safetyNote: '',
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
