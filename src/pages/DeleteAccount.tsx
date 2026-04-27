import { Link } from 'react-router-dom';

export default function DeleteAccount() {
  return (
    <div style={{ background: '#0B1026', minHeight: '100vh', color: '#C8BDB0' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 40 }}>
        <Link
          to="/"
          style={{ color: '#D4943A', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 32 }}
        >
          ← Tillbaka
        </Link>

        <h1 style={{ color: '#D4943A', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Radera konto</h1>
        <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 32 }}>Senast uppdaterad: 27 april 2026</p>

        <p style={{ lineHeight: 1.7, marginBottom: 32 }}>
          Du har rätt att när som helst radera ditt Bonki-konto och alla personuppgifter kopplade till det. Den här sidan beskriver hur du gör — direkt i appen eller via e-post om du inte längre har åtkomst till appen.
        </p>

        <Section title="1. Radera direkt i appen (rekommenderat)">
          <p>Det snabbaste sättet är att radera ditt konto direkt i Bonki:</p>
          <ul>
            <li>Öppna appen och logga in.</li>
            <li>Gå till <strong>Konto → Radera konto</strong>.</li>
            <li>Bekräfta raderingen.</li>
          </ul>
          <p>Raderingen sker omedelbart och är oåterkallelig.</p>
        </Section>

        <Section title="2. Utan app-tillgång">
          <p>Om du inte längre har åtkomst till appen — till exempel om du har bytt enhet eller inte kan logga in — kan du begära radering via e-post:</p>
          <ul>
            <li>Skicka ett e-postmeddelande till <a href="mailto:hello@bonkistudio.com" style={{ color: '#D4943A' }}>hello@bonkistudio.com</a>.</li>
            <li>Skicka från <strong>samma e-postadress</strong> som du använder för ditt Bonki-konto, så vi kan verifiera att begäran kommer från dig.</li>
            <li>Skriv "Radera konto" i ämnesraden.</li>
          </ul>
          <p>Vi raderar ditt konto inom 30 dagar och bekräftar via e-post när det är gjort.</p>
        </Section>

        <Section title="3. Vad raderas">
          <p>När ditt konto raderas tar vi permanent bort:</p>
          <ul>
            <li>Din profil och e-postadress</li>
            <li>Alla dina samtal och sessionshistorik</li>
            <li>Alla dina reflektioner och journalanteckningar</li>
            <li>Dina takeaways och sparade insikter</li>
            <li>Dina bookmarks och favoriter</li>
            <li>Notisinställningar och påminnelser</li>
            <li>Information om vilka produkter du har köpt åtkomst till</li>
          </ul>
        </Section>

        <Section title="4. Vad sparas av juridiska skäl">
          <p>Efter att du raderat ditt konto raderas alla personuppgifter omedelbart, förutom det som lagen kräver att vi behåller:</p>
          <ul>
            <li>Kvittoreferenser för bokföring (sparas i upp till 7 år enligt svensk bokföringslag)</li>
          </ul>
          <p>Dessa uppgifter är frikopplade från ditt användarkonto och används endast för att uppfylla rättsliga krav.</p>
        </Section>

        <Section title="5. Mer information">
          <p>För fullständig information om hur vi hanterar dina personuppgifter, se vår <Link to="/privacy" style={{ color: '#D4943A' }}>integritetspolicy</Link>.</p>
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
