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
  /** Right offset for tile placement (default: '-5%') */
  tileRight?: string;
  /** Height multiplier for tile placement (default: '160%') */
  tileHeight?: string;
}

/**
 * Category ID → creature config
 * Opacities are individually calibrated per image density.
 */
export const STILL_US_CREATURES: Record<string, StillUsCreature> = {
  'emotional-intimacy': {       // Ni i er → Säl  (Grunden)
    src: creatureSal,
    objectPosition: '65% 30%',
    tileOpacity: 0.28,
    headerOpacity: 0.30,
  },
  'communication': {            // Vardagen mellan er → Apa  (Grunden)
    src: creatureApa,
    objectPosition: '55% 15%',
    tileOpacity: 0.24,
    headerOpacity: 0.28,
  },
  'category-8': {               // Att hålla kvar varandra → Panda  (Grunden)
    src: creaturePanda,
    objectPosition: '55% 10%',
    tileOpacity: 0.28,
    headerOpacity: 0.30,
  },
  'individual-needs': {         // När ni tycker olika → Sköldpadda  (Det som formar er)
    src: creatureTurtle,
    objectPosition: '60% 20%',
    tileOpacity: 0.35,
    headerOpacity: 0.35,
  },
  'parenting-together': {       // Det ni bär med er → Uggla  (Det som formar er)
    src: creatureUggla,
    objectPosition: '55% 10%',
    tileOpacity: 0.35,
    headerOpacity: 0.35,
  },
  'category-9': {               // Dit ni är på väg → Lejon  (Det som formar er)
    src: creatureLejon,
    objectPosition: '55% 15%',
    tileOpacity: 0.35,
    headerOpacity: 0.35,
  },
  'category-6': {               // Trygghet & mod → Elefant  (Djupet)
    src: creatureElefant,
    objectPosition: '55% 20%',
    tileOpacity: 0.38,
    headerOpacity: 0.38,
  },
  'daily-life': {               // Nära varandra → Rådjur  (Djupet)
    src: creatureRadjur,
    objectPosition: '60% 15%',
    tileOpacity: 0.38,
    headerOpacity: 0.38,
  },
  'category-10': {              // Att välja varandra → Örn  (Djupet)
    src: creatureOrn,
    objectPosition: '55% 10%',
    tileOpacity: 0.38,
    headerOpacity: 0.38,
  },
};
