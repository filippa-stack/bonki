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
        <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 32 }}>Senast uppdaterad: 10 april 2026</p>

        <p style={{ lineHeight: 1.7, marginBottom: 24 }}>
          Bonki ("vi", "oss", "vår") drivs av Bonki Studio. Vi värnar om din integritet och vill vara transparenta med hur vi hanterar dina uppgifter. Denna policy beskriver vilka uppgifter vi samlar in, varför, och hur vi skyddar dem.
        </p>

        <Section title="1. Vilka uppgifter vi samlar in">
          <p><strong>Kontouppgifter:</strong> Din e-postadress, som du anger vid registrering. Vi använder den för inloggning via magic link och för att skicka viktiga meddelanden om ditt konto.</p>
          <p><strong>Reflektioner och samtal:</strong> De texter du skriver under guidade samtal sparas i din journal. Dessa är privata och kopplade till ditt konto.</p>
          <p><strong>Sessionsdata:</strong> Information om vilka samtal du har genomfört, din framsteg, och vilka produkter du har tillgång till.</p>
          <p><strong>Betalningsuppgifter:</strong> Betalningar hanteras av Stripe. Vi lagrar aldrig dina kortuppgifter — Stripe hanterar all betalningsinformation direkt. Vi sparar enbart en referens till ditt köp för att ge dig tillgång till rätt produkt.</p>
          <p><strong>Teknisk data:</strong> Vi kan samla in grundläggande teknisk information som enhetstyp och webbläsare för att säkerställa att appen fungerar korrekt.</p>
        </Section>

        <Section title="2. Hur vi använder dina uppgifter">
          <ul>
            <li>För att ge dig tillgång till ditt konto och dina sparade reflektioner</li>
            <li>För att hantera dina köp och produktåtkomst</li>
            <li>För att skicka inloggningslänkar och viktiga kontorelaterade meddelanden</li>
            <li>För att förbättra appen och åtgärda tekniska problem</li>
          </ul>
        </Section>

        <Section title="3. Delning med tredje part">
          <p>Vi säljer aldrig dina uppgifter. Vi delar enbart data med följande tjänster som är nödvändiga för att appen ska fungera:</p>
          <ul>
            <li>Supabase (EU) — datalagring och autentisering</li>
            <li>Stripe — betalningshantering</li>
            <li>Resend — e-postutskick för notifikationer</li>
          </ul>
          <p>Dessa tjänster har sina egna integritetspolicyer och hanterar data enligt GDPR.</p>
        </Section>

        <Section title="4. Datalagring och säkerhet">
          <p>Dina uppgifter lagras hos Supabase med servrar inom EU. All kommunikation mellan din enhet och våra servrar är krypterad (HTTPS/TLS). Autentisering sker via säkra magic links — vi lagrar inga lösenord.</p>
        </Section>

        <Section title="5. Dina rättigheter">
          <p>Enligt GDPR har du rätt att:</p>
          <ul>
            <li>Begära tillgång till de uppgifter vi har om dig</li>
            <li>Begära rättelse av felaktiga uppgifter</li>
            <li>Begära radering av dina uppgifter och ditt konto</li>
            <li>Begära begränsning av behandlingen av dina uppgifter</li>
            <li>Invända mot behandling av dina uppgifter</li>
            <li>Begära dataportabilitet</li>
          </ul>
          <p>Kontakta oss på <a href="mailto:hej@bonkiapp.com" style={{ color: '#D4943A' }}>hej@bonkiapp.com</a> för att utöva dina rättigheter.</p>
        </Section>

        <Section title="6. Barn och integritet">
          <p>Bonki innehåller produkter riktade till familjer med barn i åldrarna 3–12+. Appen används alltid tillsammans med en vuxen. Vi samlar inte medvetet in personuppgifter från barn. Alla konton skapas av vuxna.</p>
        </Section>

        <Section title="7. Cookies och lokal lagring">
          <p>Bonki använder localStorage i din webbläsare för att spara inställningar och möjliggöra offlinefunktionalitet. Vi använder inga tredjepartscookies för spårning eller reklam.</p>
        </Section>

        <Section title="8. Ändringar i denna policy">
          <p>Vi kan uppdatera denna integritetspolicy vid behov. Vid väsentliga ändringar meddelar vi dig via appen eller e-post. Den senaste versionen finns alltid tillgänglig på denna sida.</p>
        </Section>

        <Section title="9. Kontakt">
          <p>Bonki Studio</p>
          <p>E-post: <a href="mailto:hej@bonkiapp.com" style={{ color: '#D4943A' }}>hej@bonkiapp.com</a></p>
          <p>Webb: <a href="https://bonkiapp.com" style={{ color: '#D4943A' }}>bonkiapp.com</a></p>
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
