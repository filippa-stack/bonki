/**
 * Per-product intro slide content.
 * Shown once on the user's first visit to each product.
 */
export interface ProductIntroSlide {
  /** Small uppercase label above the heading */
  kicker?: string;
  heading: string;
  /** Body text — use \n\n to separate paragraphs */
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
  /** CTA label for the free-card spotlight slide (auto-appended) */
  freeCardCtaLabel?: string;
}

export const productIntros: Record<string, ProductIntroData> = {
  still_us: {
    productId: 'still_us',
    slides: [
      {
        heading: 'Välkommen till Vårt Vi',
        body: 'Ni pratar varje dag. Om hämtningen, middagen, helgen. Men när pratade ni senast med varandra — på riktigt?\n\nVårt Vi är för par som fortfarande fungerar, men som märkt att något tystnat. Samtalen tar er förbi det praktiska och in i det som finns under. Det här är inte terapi — det är de samtal ni redan vill ha, men inte hittar vägen in till.',
      },
    ],
    ctaLabel: 'Börja utforska',
    freeCardCtaLabel: 'Börja med Ert första samtal',
  },

  jag_i_mig: {
    productId: 'jag_i_mig',
    slides: [
      {
        heading: 'Välkommen till\nJag i Mig',
        body: 'Det här är ett samtal om vem ditt barn är — just nu, idag. Inte den som svarar "bra" på hur var din dag. Utan den riktiga. Den som har en favoritkänsla, en hemlig rädsla, en dröm som ingen frågat om än.\n\nDet enda som behövs är att ni är tillsammans. Resten tar samtalet hand om.',
      },
    ],
    ctaLabel: 'Sätt igång',
    freeCardCtaLabel: 'Börja med Glad',
  },

  jag_med_andra: {
    productId: 'jag_med_andra',
    slides: [
      {
        heading: 'Välkommen till\nJag med Andra',
        body: 'Ditt barn har börjat titta utåt. Kompisarna har blivit viktigare, blickarna fler, och frågor som förut var enkla — vem får vara med, vad är rättvist, vem bestämmer — har plötsligt blivit på riktigt.\n\nDet här är samtal för den ålder där man börjar förstå att andra också har en insida. Att mod inte alltid syns. Att skam kan göra att man blir tyst. Samtalen öppnar det som sällan får plats i vardagen.',
      },
    ],
    ctaLabel: 'Sätt igång',
    freeCardCtaLabel: 'Börja med Vänskap',
  },

  jag_i_varlden: {
    productId: 'jag_i_varlden',
    slides: [
      {
        heading: 'Välkommen till\nJag i Världen',
        body: 'Du lever i en tid där alla har åsikter om vem du ska vara. Men vad tänker du?\n\nDet här är frågor om de stora sakerna. Identitet, rättvisa, mod, skam, kärlek, psykisk hälsa, vad det innebär att vara fri. De är till för att du ska få tänka högt.',
      },
    ],
    ctaLabel: 'Sätt igång',
    freeCardCtaLabel: 'Börja med Identitet',
  },

  vardagskort: {
    productId: 'vardagskort',
    slides: [
      {
        heading: 'Välkommen till Vardag',
        body: 'Morgonstressen. Middagen. Läggdags. Det är lätt att vardagen bara händer — utan att ni stannar upp och pratar om hur den egentligen ser ut för var och en.\n\nDet här är samtal för alla de små sakerna som bygger en familj. De tar er förbi "bra" och "som vanligt" — in i det som ditt barn faktiskt tänkte på vägen hem.',
      },
    ],
    ctaLabel: 'Sätt igång',
    freeCardCtaLabel: 'Börja med Hur var din dag',
  },

  syskonkort: {
    productId: 'syskonkort',
    slides: [
      {
        heading: 'Välkommen till Syskon',
        body: 'Syskon är de första människorna vi lär oss dela med, bråka med, längta efter och bli galna på — ibland allt på samma dag.\n\nDet här är frågor som hjälper er prata om det som finns mellan er. Inte bara det roliga, utan också det svåra: orättvisor, jämförelser, känslan av att inte räcka till. Och det fina — den där kunskapen om varandra som ingen annan har.',
      },
    ],
    ctaLabel: 'Sätt igång',
    freeCardCtaLabel: 'Börja med Syskonkunskap',
  },

  sexualitetskort: {
    productId: 'sexualitetskort',
    slides: [
      {
        heading: 'Välkommen till Sexualitet',
        body: 'Det här handlar om det som de flesta tycker är svårt att prata om — och som därför behöver pratas om mest.\n\nSamtalen tar upp kropp, samtycke, normer, gränser, identitet och känslor kopplade till sex och sexualitet — utan att moralisera. Syftet är inte att tala om rätt eller fel, utan att ge utrymme att tänka, fråga och formulera var du står.',
        signoff: 'Hoppa över det som inte passar just nu. Den finns kvar.',
      },
    ],
    ctaLabel: 'Sätt igång',
    freeCardCtaLabel: 'Börja med Normer',
  },
};
