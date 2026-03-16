/**
 * Still Us category → creature mapping.
 * Each category has a spirit animal that appears as a dimmed
 * atmospheric texture on tiles and category headers.
 */
import creatureSal from '@/assets/creature-sal-still-us.png';
import creatureUggla from '@/assets/creature-uggla.png';
import creatureTurtle from '@/assets/creature-turtle.png';
import creaturePanda from '@/assets/creature-panda.png';
import creatureLejon from '@/assets/creature-lejon.png';
import creatureElefant from '@/assets/creature-elefant.png';
import creatureRadjur from '@/assets/creature-radjur.png';
import creatureOrn from '@/assets/creature-orn.png';

// Apa doesn't have a standalone asset yet — we import the JIM illustration
import creatureApa from '@/assets/apa-jag-i-mig.png';

export interface StillUsCreature {
  src: string;
  objectPosition: string;
  /** Opacity for home accordion tiles (small) */
  tileOpacity: number;
  /** Opacity for category view header */
  headerOpacity: number;
}

/**
 * Category ID → creature config
 * Opacities are individually calibrated per image density.
 */
export const STILL_US_CREATURES: Record<string, StillUsCreature> = {
  'emotional-intimacy': {       // Ni i er → Säl
    src: creatureSal,
    objectPosition: '50% 30%',
    tileOpacity: 0.12,
    headerOpacity: 0.18,
  },
  'communication': {            // Vardagen mellan er → Apa
    src: creatureApa,
    objectPosition: '50% 25%',
    tileOpacity: 0.10,
    headerOpacity: 0.15,
  },
  'category-8': {               // Att hålla kvar varandra → Panda
    src: creaturePanda,
    objectPosition: '50% 20%',
    tileOpacity: 0.12,
    headerOpacity: 0.18,
  },
  'individual-needs': {         // När ni tycker olika → Sköldpadda
    src: creatureTurtle,
    objectPosition: '50% 30%',
    tileOpacity: 0.10,
    headerOpacity: 0.15,
  },
  'parenting-together': {       // Det ni bär med er → Uggla
    src: creatureUggla,
    objectPosition: '50% 20%',
    tileOpacity: 0.12,
    headerOpacity: 0.18,
  },
  'category-9': {               // Dit ni är på väg → Lejon
    src: creatureLejon,
    objectPosition: '50% 25%',
    tileOpacity: 0.12,
    headerOpacity: 0.18,
  },
  'category-6': {               // Trygghet & mod → Elefant
    src: creatureElefant,
    objectPosition: '50% 30%',
    tileOpacity: 0.10,
    headerOpacity: 0.15,
  },
  'daily-life': {               // Nära varandra → Rådjur
    src: creatureRadjur,
    objectPosition: '50% 25%',
    tileOpacity: 0.12,
    headerOpacity: 0.18,
  },
  'category-10': {              // Att välja varandra → Örn
    src: creatureOrn,
    objectPosition: '50% 20%',
    tileOpacity: 0.10,
    headerOpacity: 0.15,
  },
};
