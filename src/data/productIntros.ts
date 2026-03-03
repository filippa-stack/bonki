/**
 * Per-product intro slide content.
 * Shown once on the user's first visit to each product.
 */
export interface ProductIntroSlide {
  /** Small uppercase label above the heading */
  kicker?: string;
  heading: string;
  body: string;
  /** Italic sign-off line */
  signoff?: string;
}

export interface ProductIntroData {
  /** Product id (matches ProductManifest.id) */
  productId: string;
  slides: ProductIntroSlide[];
  /** CTA button text on last slide */
  ctaLabel: string;
}

export const productIntros: Record<string, ProductIntroData> = {
  still_us: {
    productId: 'still_us',
    slides: [
      {
        heading: 'Ett gemensamt rum.',
        body: 'Still Us är skapat för er — ett utrymme att mötas i, mitt i vardagen.',
        signoff: 'För samtal ni vill hålla levande.',
      },
      {
        kicker: 'Tillsammans',
        heading: 'Utforska tillsammans.',
        body: 'Välj ett ämne. Läs frågorna högt. Lyssna. Reflektera.',
        signoff: 'Det finns inget rätt sätt — bara ert.',
      },
    ],
    ctaLabel: 'Börja utforska',
  },

  jag_i_mig: {
    productId: 'jag_i_mig',
    slides: [
      {
        heading: 'Det här är ditt rum.',
        body: 'Här utforskar du det som händer inuti — tankar, känslor och allt däremellan.',
        signoff: 'Bara du bestämmer takten.',
      },
    ],
    ctaLabel: 'Sätt igång',
  },

  jag_med_andra: {
    productId: 'jag_med_andra',
    slides: [
      {
        heading: 'Du och de andra.',
        body: 'Hur är det att vara kompis? Att bli arg? Att säga förlåt? Här pratar ni om allt det.',
        signoff: 'Tillsammans, en fråga i taget.',
      },
    ],
    ctaLabel: 'Sätt igång',
  },

  jag_i_varlden: {
    productId: 'jag_i_varlden',
    slides: [
      {
        heading: 'Världen utanför.',
        body: 'Stora frågor om rättvisa, mod och vad du vill förändra. Här får du tänka fritt.',
        signoff: 'Din röst spelar roll.',
      },
    ],
    ctaLabel: 'Sätt igång',
  },

  vardagskort: {
    productId: 'vardagskort',
    slides: [
      {
        heading: 'Mitt i vardagen.',
        body: 'Morgon, middag och kväll — samtal som passar in precis där ni befinner er.',
        signoff: 'Små stunder, stora insikter.',
      },
    ],
    ctaLabel: 'Sätt igång',
  },

  syskonkort: {
    productId: 'syskonkort',
    slides: [
      {
        heading: 'Syskon emellan.',
        body: 'Att dela rum, föräldrar och minnen. Här får ni utforska vad det innebär att vara syskon.',
        signoff: 'Ni är unika — tillsammans och var för sig.',
      },
    ],
    ctaLabel: 'Sätt igång',
  },

  sexualitetskort: {
    productId: 'sexualitetskort',
    slides: [
      {
        heading: 'Kropp, gränser och nyfikenhet.',
        body: 'Frågor om det som kan vara svårt att ta upp — i en trygg form, utan press.',
        signoff: 'Dina frågor är viktiga.',
      },
    ],
    ctaLabel: 'Sätt igång',
  },
};
