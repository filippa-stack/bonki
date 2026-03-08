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
        heading: 'V\u00e4lkommen till Still Us',
        body: 'Ni pratar varje dag. Om middagen, om schemat, om barnen. Men har ni ett s\u00e4tt att prata om det som \u00e4r sv\u00e5rt \u2014 innan det blir f\u00f6r sv\u00e5rt?\n\nStill Us bygger det som saknas i de flesta relationer: en gemensam infrastruktur f\u00f6r de samtal som annars aldrig blir av. Inte ett enstaka bra samtal, utan f\u00f6rm\u00e5gan att ha dem \u2014 om och om igen, \u00e4ven n\u00e4r det skaver.\n\nVarje kort \u00e4r sekvenserat. Ni b\u00f6rjar d\u00e4r det \u00e4r tryggt och r\u00f6r er gradvis mot det som betyder mest. Inget kan g\u00f6ras ensam. Allt kr\u00e4ver er b\u00e5da.',
        signoff: 'Ert f\u00f6rsta samtal v\u00e4ntar. Det \u00e4r gratis.',
      },
    ],
    ctaLabel: 'B\u00f6rja utforska',
    freeCardCtaLabel: 'B\u00f6rja med Ert minsta "vi"',
  },

  jag_i_mig: {
    productId: 'jag_i_mig',
    slides: [
      {
        heading: 'Välkommen till\nJag i Mig',
        body: 'Det här är ett samtal mellan dig och ditt barn om vem hen är - just nu, idag.\n\nInte den version som skyndar sig till skolan på morgonen. Inte den som svarar "bra" på hur var din dag. Utan den riktiga. Den som har en favoritkänsla, en hemlig rädsla, en dröm som ingen frågat om än.\n\nFrågorna här inne är enkla. Ditt enda jobb är att lyssna - inte rätta, inte förklara. Ditt barn vet mer om sig själv än du tror. De behöver bara bli frågade.',
        signoff: 'Välj ett kort. Hitta en lugn stund. Och låt samtalet ta er dit det vill.',
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
        body: 'Ditt barn har börjat titta utåt. Kompisarna har blivit viktigare, blickarna fler, och frågor som förut var enkla - vem får vara med, vad är rättvist, vem bestämmer - har plötsligt blivit på riktigt.\n\nDet här är kort för den ålder där man börjar förstå att andra människor har en insida också. Att mod inte alltid syns. Att skam kan göra att man blir tyst. Att vänskap kräver mer än att bara vara i samma rum.\n\nFrågorna har inga rätta svar. De är till för att öppna det som sällan får plats i vardagen - mellan er, eller i en grupp. Det viktigaste är inte vad som sägs, utan att det får sägas.',
        signoff: 'Ni bestämmer tempot. Hoppa över det som inte passar. Stanna kvar där det blir intressant.',
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
        body: 'Du lever i en tid där alla har åsikter om vem du ska vara. Sociala medier, kompisar, vuxna, samhället - alla har en bild. Men vad tänker du?\n\nDet här är frågor om de stora sakerna. Identitet, rättvisa, mod, skam, kärlek, psykisk hälsa, vad det innebär att vara fri. De är inte till för att testa dig. De är till för att du ska få tänka högt - ensam, med en vän, med en förälder, i en grupp.\n\nDet finns inga rätta svar. Det finns bara dina.',
        signoff: 'Hoppa över det som inte känns aktuellt. Stanna vid det som gör att du tänker till.',
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
        body: 'Morgonstressen. Middagen. Läggdagsbråket. Det är lätt att vardagen bara händer - utan att ni stannar upp och pratar om hur den egentligen ser ut för var och en.\n\nDet här är kort för alla de små sakerna som bygger en familj: rutiner, helger, skola, kompisar, mat, sömn. Frågorna är inte djupa på det komplicerade sättet - de är djupa på det vardagliga sättet. Som att ta reda på vad ditt barn faktiskt tänkte på vägen hem. Eller vad helgen egentligen betyder för dem.',
        signoff: 'Perfekt för middagsbordet, bilen, eller en söndag som behöver lite mer av varandra.',
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
        body: 'Syskon är de första människorna vi lär oss dela med, bråka med, längta efter och bli galna på - ibland allt på samma dag.\n\nDet här är frågor som hjälper er prata om det som finns mellan er. Inte bara de roliga minnena, utan också det som är svårt: orättvisor, jämförelser, känslan av att inte räcka till. Och det fina: den där kunskapen om varandra som ingen annan har.\n\nNi kan använda korten alla tillsammans, eller två och två. Ibland blir svaren överraskande. Det är meningen.',
        signoff: 'Börja där det känns naturligt. Hoppa över det som inte passar. Stanna kvar i det som öppnar sig.',
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
        body: 'Det här handlar om det som de flesta tycker är svårt att prata om - och som därför behöver pratas om mest.\n\nKorten tar upp kropp, samtycke, normer, gränser, identitet och känslor kopplade till sex och sexualitet. De gör det utan att moralisera. Syftet är inte att tala om vad som är rätt eller fel, utan att ge dig utrymme att tänka, fråga och formulera var du står.\n\nDu kan använda korten på egen hand, med en kompis, en partner, en förälder, eller i en grupp. Det viktigaste är att samtalet känns tryggt. Om en fråga inte passar just nu - hoppa över den. Den finns kvar.',
        signoff: 'Och om något väcker frågor eller oro: UMO.se och BRIS finns alltid tillgängliga.',
      },
    ],
    ctaLabel: 'Sätt igång',
    freeCardCtaLabel: 'Börja med Normer',
  },
};
