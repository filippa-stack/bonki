/**
 * Still Us category → creature mapping.
 * Each category has a spirit animal that appears as a dimmed
 * atmospheric texture on tiles and category headers.
 *
 * `tileScale` is an individual optical-balance multiplier per animal.
 * Because each illustration has different amounts of built-in padding
 * and negative space, a uniform size makes some look huge and others
 * tiny. Tune tileScale per animal so they *feel* the same size.
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
  /** Right offset for tile placement (default: '0%') */
  tileRight?: string;
  /** Base height for tile placement — uniform across all animals */
  tileHeight?: string;
  /**
   * Per-animal optical scale multiplier (default: 1).
   * Tune this to make every animal *appear* the same visual weight
   * despite different built-in padding/negative space.
   */
  tileScale?: number;
  /**
   * Vertical anchor point (default: '50%').
   * Increase above 50% to push the image down, revealing more of the head/eyes.
   */
  tileTop?: string;
}

/**
 * Category ID → creature config
 * Opacities are individually calibrated per image density.
 * tileScale is individually tuned so all animals look the same size.
 */
export const STILL_US_CREATURES: Record<string, StillUsCreature> = {
  'emotional-intimacy': {       // Ni i er → Säl  (Grunden)
    src: creatureSal,
    objectPosition: '50% 30%',
    tileOpacity: 0.35,
    headerOpacity: 0.35,
    tileRight: '-5%',
    tileHeight: '220%',
    tileScale: 1.1,
    tileTop: '58%',            // Seal: push down to show round face
  },
  'communication': {            // Vardagen mellan er → Apa  (Grunden)
    src: creatureApa,
    objectPosition: '45% 20%',
    tileOpacity: 0.35,
    headerOpacity: 0.35,
    tileRight: '-8%',
    tileHeight: '220%',
    tileScale: 1.05,
    tileTop: '60%',            // Monkey: eyes high on head, push down more
  },
  'category-8': {               // Att hålla kvar varandra → Panda  (Grunden)
    src: creaturePanda,
    objectPosition: '50% 15%',
    tileOpacity: 0.36,
    headerOpacity: 0.35,
    tileRight: '-5%',
    tileHeight: '220%',
    tileScale: 1.1,
    tileTop: '63%',            // Panda: push down more to show eyes
  },
  'individual-needs': {         // När ni tycker olika → Sköldpadda  (Det som formar er)
    src: creatureTurtle,
    objectPosition: '50% 25%',
    tileOpacity: 0.38,
    headerOpacity: 0.38,
    tileRight: '-5%',
    tileHeight: '220%',
    tileScale: 1.25,
    tileTop: '58%',            // Turtle: small head, push down to reveal eyes
  },
  'parenting-together': {       // Det ni bär med er → Uggla  (Det som formar er)
    src: creatureUggla,
    objectPosition: '50% 15%',
    tileOpacity: 0.36,
    headerOpacity: 0.36,
    tileRight: '-8%',
    tileHeight: '220%',
    tileScale: 1.05,
    tileTop: '63%',            // Owl: push down more to show eyes
  },
  'category-9': {               // Dit ni är på väg → Lejon  (Det som formar er)
    src: creatureLejon,
    objectPosition: '50% 20%',
    tileOpacity: 0.36,
    headerOpacity: 0.36,
    tileRight: '-8%',
    tileHeight: '220%',
    tileScale: 0.95,
    tileTop: '55%',            // Lion: face visible, slight push
  },
  'category-6': {               // Trygghet & mod → Elefant  (Djupet)
    src: creatureElefant,
    objectPosition: '50% 25%',
    tileOpacity: 0.38,
    headerOpacity: 0.38,
    tileRight: '-5%',
    tileHeight: '220%',
    tileScale: 0.9,
    tileTop: '55%',            // Elephant: eyes mid-head, slight push
  },
  'daily-life': {               // Nära varandra → Rådjur  (Djupet)
    src: creatureRadjur,
    objectPosition: '50% 20%',
    tileOpacity: 0.38,
    headerOpacity: 0.38,
    tileRight: '-8%',
    tileHeight: '220%',
    tileScale: 1.2,
    tileTop: '55%',            // Deer: tall/thin, slight push
  },
  'category-10': {              // Att välja varandra → Örn  (Djupet)
    src: creatureOrn,
    objectPosition: '50% 15%',
    tileOpacity: 0.36,
    headerOpacity: 0.36,
    tileRight: '-8%',
    tileHeight: '220%',
    tileScale: 1.15,
    tileTop: '55%',            // Eagle: head at top, slight push
  },
};
