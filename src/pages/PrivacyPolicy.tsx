import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div style={{ background: '#0B1026', minHeight: '100vh', color: '#C8BDB0' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 40 }}>
        <Link
          to="/"
          style={{ color: '#D4943A', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 32 }}
        >
          ← Tillbaka
        </Link>

        <h1 style={{ color: '#D4943A', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Integritetspolicy</h1>
        <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 32 }}>Senast uppdaterad: 27 april 2026</p>

        <p style={{ lineHeight: 1.7, marginBottom: 24 }}>
          Bonki ("vi", "oss", "vår") drivs av Bonki & Friends AB (org.nr finns på begäran), Sverige. Vi värnar om din integritet och vill vara transparenta med hur vi hanterar dina uppgifter. Denna policy beskriver vilka uppgifter vi samlar in, varför, hur vi skyddar dem, och vilka rättigheter du har enligt GDPR och annan tillämplig dataskyddslagstiftning.
        </p>

        <p style={{ lineHeight: 1.7, marginBottom: 32, fontStyle: 'italic', opacity: 0.85 }}>
          Bonki är inte en medicinsk produkt och ersätter inte professionell vård eller terapi. Innehållet är utvecklat tillsammans med legitimerade psykologer som ett samtalsverktyg för familjer och par, inte som behandling, diagnos eller medicinsk rådgivning. Om du eller någon i din familj behöver professionellt stöd, kontakta vårdcentral, BUP eller 1177 Vårdguiden.
        </p>

        <Section title="1. Personuppgiftsansvarig">
          <p>Bonki & Friends AB är personuppgiftsansvarig för behandlingen av dina personuppgifter inom Bonki-tjänsten.</p>
          <p>Kontakt: <a href="mailto:sofia@bonkistudio.com" style={{ color: '#D4943A' }}>sofia@bonkistudio.com</a></p>
        </Section>

        <Section title="2. Vilka uppgifter vi samlar in">
          <p><strong>Kontouppgifter:</strong> Din e-postadress, som du anger vid registrering. Om du loggar in med "Logga in med Apple" kan du välja att dela en privat relay-adress istället för din riktiga e-post — vi ser då bara den anonymiserade adressen.</p>
          <p><strong>Reflektioner och samtal:</strong> De texter du skriver under guidade samtal sparas i din privata journal, kopplade till ditt konto. Innehållet är endast synligt för dig.</p>
          <p><strong>Sessionsdata:</strong> Information om vilka samtal du har påbörjat eller genomfört, din framsteg, vilka kort du sparat, och vilka produkter du har köpt tillgång till.</p>
          <p><strong>Betalningsuppgifter:</strong> Vi lagrar aldrig dina kortuppgifter. Betalningar hanteras direkt av Stripe (på webben) eller Apple via App Store / In-App Purchase med RevenueCat (i iOS-appen). Vi sparar enbart en kvitto-referens och vilka produkter du har tillgång till.</p>
          <p><strong>Inloggningsleverantör:</strong> Om du loggar in med Apple sparas en anonymiserad identifierare (Apple "sub") för att kunna autentisera dig vid kommande inloggningar.</p>
          <p><strong>Teknisk data:</strong> Grundläggande teknisk information som enhetstyp, operativsystem och appversion samlas in för att säkerställa att appen fungerar korrekt och för att kunna felsöka problem. Vi använder inte denna information för spårning över andra appar eller webbplatser.</p>
          <p><strong>Vad vi inte samlar in:</strong> Vi samlar inte in din plats, dina kontakter, ditt fotobibliotek, din mikrofon eller kamera. Vi spårar dig inte över andra appar eller webbplatser för annonseringsändamål.</p>
        </Section>

        <Section title="3. Rättslig grund för behandlingen (GDPR Art. 6)">
          <p>Vi behandlar dina personuppgifter på följande rättsliga grunder:</p>
          <ul>
            <li><strong>Avtal (Art. 6.1.b):</strong> För att tillhandahålla appens funktioner som du registrerat dig för (konto, journal, sessioner, produktåtkomst).</li>
            <li><strong>Berättigat intresse (Art. 6.1.f):</strong> För att förbättra appen, åtgärda tekniska fel och skydda mot missbruk.</li>
            <li><strong>Rättslig förpliktelse (Art. 6.1.c):</strong> För att uppfylla bokföringskrav kopplade till köp.</li>
            <li><strong>Samtycke (Art. 6.1.a):</strong> Endast där det krävs uttryckligen, till exempel för icke-nödvändig kommunikation. Du kan när som helst återkalla samtycke.</li>
          </ul>
        </Section>

        <Section title="4. Hur vi använder dina uppgifter">
          <ul>
            <li>För att ge dig tillgång till ditt konto, dina sparade reflektioner och dina köpta produkter</li>
            <li>För att hantera dina köp och låsa upp produktåtkomst</li>
            <li>För att skicka inloggningskoder och viktiga kontorelaterade meddelanden (t.ex. kvitton)</li>
            <li>För att förbättra appen, åtgärda tekniska problem och förhindra missbruk</li>
            <li>För att uppfylla rättsliga krav (t.ex. bokföring av köp)</li>
          </ul>
          <p>Vi använder inte dina reflektioner eller journalanteckningar för att träna AI-modeller, och vi delar dem inte med tredje part.</p>
        </Section>

        <Section title="5. Tredje parter och underbiträden">
          <p>Vi säljer aldrig dina uppgifter. Vi delar enbart data med följande tjänsteleverantörer (underbiträden) som är nödvändiga för att appen ska fungera:</p>
          <ul>
            <li><strong>Supabase (EU-region):</strong> Datalagring, autentisering och backend. Servrar inom EU.</li>
            <li><strong>Stripe (EU/USA):</strong> Betalningshantering på webben. Stripe är PCI-DSS-certifierad och har egna dataskyddsåtaganden inklusive Standard Contractual Clauses (SCC) för överföringar utanför EU.</li>
            <li><strong>Apple Inc. (USA):</strong> In-App Purchase-hantering på iOS. När du köper i iOS-appen sker betalningen via Apple och regleras av Apples integritetspolicy.</li>
            <li><strong>RevenueCat (USA):</strong> Validering av iOS-köp och hantering av produktåtkomst på iOS. Använder Standard Contractual Clauses (SCC) för EU-överföringar.</li>
            <li><strong>Resend (EU):</strong> Utskick av inloggningskoder och kontorelaterad e-post.</li>
          </ul>
          <p>Samtliga underbiträden är bundna av personuppgiftsbiträdesavtal (DPA) och hanterar data enligt GDPR. Överföringar utanför EU/EES sker endast med tillämpliga skyddsåtgärder enligt GDPR kapitel V (typiskt SCC).</p>
        </Section>

        <Section title="6. Datalagring och säkerhet">
          <p>Dina uppgifter lagras hos Supabase med servrar inom EU. All kommunikation mellan din enhet och våra servrar är krypterad med TLS/HTTPS. Lösenord lagras aldrig i klartext, och inloggning sker primärt via engångskoder skickade via e-post eller via Logga in med Apple.</p>
          <p><strong>Lagringstid:</strong></p>
          <ul>
            <li>Kontodata och journalanteckningar: så länge ditt konto är aktivt.</li>
            <li>Köphistorik: minst 7 år, för att uppfylla svenska bokföringskrav.</li>
            <li>Tekniska loggar: max 90 dagar.</li>
            <li>Efter att du raderat ditt konto: alla personuppgifter raderas omedelbart, förutom det som lagen kräver att vi behåller (t.ex. kvittoreferenser för bokföring).</li>
          </ul>
        </Section>

        <Section title="7. Dina rättigheter">
          <p>Enligt GDPR har du rätt att:</p>
          <ul>
            <li>Begära tillgång till de uppgifter vi har om dig (registerutdrag)</li>
            <li>Begära rättelse av felaktiga uppgifter</li>
            <li>Begära radering av dina uppgifter och ditt konto ("rätten att bli glömd")</li>
            <li>Begära begränsning av behandlingen av dina uppgifter</li>
            <li>Invända mot behandling som sker på grund av berättigat intresse</li>
            <li>Begära dataportabilitet (få ut dina uppgifter i ett maskinläsbart format)</li>
            <li>Återkalla samtycke när som helst, där behandlingen baseras på samtycke</li>
            <li>Lämna in klagomål till tillsynsmyndighet — i Sverige är detta <a href="https://www.imy.se" style={{ color: '#D4943A' }} target="_blank" rel="noopener noreferrer">Integritetsskyddsmyndigheten (IMY)</a></li>
          </ul>
          <p>Kontakta oss på <a href="mailto:sofia@bonkistudio.com" style={{ color: '#D4943A' }}>sofia@bonkistudio.com</a> för att utöva dina rättigheter. Vi svarar inom 30 dagar.</p>
        </Section>

        <Section title="8. Radera ditt konto">
          <p>Du kan radera ditt konto direkt i appen via <strong>Konto → Radera konto</strong>. Detta tar permanent bort:</p>
          <ul>
            <li>Ditt användarkonto och e-postadress</li>
            <li>Alla dina reflektioner och journalanteckningar</li>
            <li>All sessionshistorik och framsteg</li>
            <li>Information om vilka produkter du köpt åtkomst till (köpkvitton kan dock behållas i upp till 7 år för bokföringsändamål)</li>
          </ul>
          <p><strong>För dig som loggat in med Apple:</strong> Vid radering återkallar vi även din Apple-token via Apples standardflöde. Du kan dessutom själv återkalla appens åtkomst när som helst på <a href="https://appleid.apple.com" style={{ color: '#D4943A' }} target="_blank" rel="noopener noreferrer">appleid.apple.com</a> → Logga in med Apple → Bonki.</p>
          <p>Radering är permanent och kan inte ångras.</p>
        </Section>

        <Section title="9. Återställ köp (iOS)">
          <p>Köp som gjorts i iOS-appen är knutna till ditt Apple-konto via App Store. Du kan när som helst återställa tidigare köp på en ny enhet via <strong>Konto → Återställ köp</strong>. Vi får då en bekräftelse från Apple/RevenueCat och låser upp dina produkter.</p>
        </Section>

        <Section title="10. Barn och integritet">
          <p>Bonki innehåller produkter riktade till familjer med barn i åldrarna 3–12+. Appen är utformad för att användas tillsammans med en vuxen vårdnadshavare.</p>
          <ul>
            <li>Konton skapas alltid av vuxna. Vi tillåter inte registrering av barn.</li>
            <li>Vi samlar inte medvetet in personuppgifter direkt från barn under 13 år (eller motsvarande lägre åldersgräns enligt lokala lagar).</li>
            <li>Vi visar ingen reklam i appen, varken till vuxna eller barn.</li>
            <li>Vi spårar inte barns aktivitet för annonseringsändamål.</li>
          </ul>
          <p>Om du som vårdnadshavare upptäcker att ett barn har skapat ett konto utan tillstånd, kontakta oss så raderar vi kontot och alla tillhörande uppgifter omedelbart.</p>
        </Section>

        <Section title="11. Cookies och lokal lagring">
          <p>Bonki använder localStorage i din webbläsare och iOS-appens lokala lagring för att spara inställningar (t.ex. språk, senaste produkt) och möjliggöra offlinefunktionalitet. Vi använder inga tredjepartscookies för spårning, profilering eller reklam.</p>
        </Section>

        <Section title="12. Spårning och reklam">
          <p>Bonki spårar dig inte över andra appar eller webbplatser. Vi använder inte Apples App Tracking Transparency-ramverk (ATT) eftersom vi inte kvalificerar för spårning. Vi visar ingen reklam i appen.</p>
        </Section>

        <Section title="13. Internationella dataöverföringar">
          <p>Huvuddelen av dina uppgifter lagras inom EU/EES (hos Supabase). Vissa underbiträden (Stripe, Apple, RevenueCat) är baserade i USA. När personuppgifter överförs utanför EU/EES sker det med tillämpliga skyddsåtgärder enligt GDPR kapitel V — typiskt EU-kommissionens Standard Contractual Clauses (SCC) och, där tillämpligt, kompletterande tekniska och organisatoriska åtgärder.</p>
        </Section>

        <Section title="14. Säkerhetsincidenter">
          <p>Vid en personuppgiftsincident som sannolikt innebär en risk för dina rättigheter och friheter kommer vi att anmäla incidenten till Integritetsskyddsmyndigheten (IMY) inom 72 timmar och, vid hög risk, även informera dig direkt utan onödigt dröjsmål.</p>
        </Section>

        <Section title="15. Ändringar i denna policy">
          <p>Vi kan uppdatera denna integritetspolicy vid behov. Vid väsentliga ändringar meddelar vi dig via appen eller e-post i god tid innan ändringarna träder i kraft. Den senaste versionen finns alltid tillgänglig på denna sida med datum för senaste uppdatering högst upp.</p>
        </Section>

        <Section title="16. Kontakt">
          <p>Bonki & Friends AB</p>
          <p>E-post: <a href="mailto:sofia@bonkistudio.com" style={{ color: '#D4943A' }}>sofia@bonkistudio.com</a></p>
          <p>Webb: <a href="https://bonkiapp.com" style={{ color: '#D4943A' }}>bonkiapp.com</a></p>
          <p style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
            Tillsynsmyndighet: Integritetsskyddsmyndigheten (IMY) — <a href="https://www.imy.se" style={{ color: '#D4943A' }} target="_blank" rel="noopener noreferrer">imy.se</a>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ color: '#D4943A', fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{title}</h2>
      <div style={{ lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
      <style>{`
        section ul { padding-left: 20px; margin: 4px 0; }
        section li { margin-bottom: 4px; }
      `}</style>
    </section>
  );
}
