import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TermsConsentProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function TermsConsent({ checked, onCheckedChange }: TermsConsentProps) {
  const { t } = useTranslation();
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          <Trans
            i18nKey="login.terms_checkbox"
            components={{
              termsLink: (
                <button
                  type="button"
                  className="underline text-foreground hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setTermsOpen(true);
                  }}
                />
              ),
              privacyLink: (
                <button
                  type="button"
                  className="underline text-foreground hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setPrivacyOpen(true);
                  }}
                />
              ),
            }}
          />
        </label>
      </div>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif">{t('login.terms_title')}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2 space-y-5 text-sm text-muted-foreground leading-relaxed">
            <p className="text-xs text-muted-foreground/60">Senast uppdaterad: Februari 2026</p>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">1. Godkännande av villkor</h3>
              <p>Genom att skapa ett konto eller använda Still Us ("Appen") godkänner du dessa villkor. Om du inte godkänner, använd inte Appen. Godkännande krävs vid registrering.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">2. Beskrivning av tjänsten</h3>
              <p>Still Us är ett digitalt samtalsverktyg för par. Det erbjuder strukturerade frågor och reflektionsövningar för att hjälpa partners kommunicera öppnare.</p>
              <p className="mt-2 font-medium text-foreground">Still Us är INTE terapi, rådgivning, psykologisk behandling eller en ersättning för professionell hjälp.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">3. Immateriella rättigheter</h3>
              <p>Allt innehåll i Appen — inklusive men inte begränsat till frågor, samtalsprompter, stegstrukturer, filosofiska ramar, kategorinamn, ämnesnamn och organiseringen av innehåll — är BONKI AB:s exklusiva immateriella egendom.</p>
              <p className="mt-2">Du får inte:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Reproducera, kopiera eller sprida appens innehåll i kommersiellt syfte</li>
                <li>Sälja, licensiera eller skapa derivatverk från appens innehåll</li>
                <li>Använda innehållet för att träna AI- eller maskininlärningsmodeller</li>
                <li>Använda innehållet för att bygga konkurrerande produkter</li>
              </ul>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">4. Användarinnehåll</h3>
              <p>Text du skriver i Appen — inklusive reflektioner, takeaways och anteckningar — tillhör helt och hållet dig. BONKI gör inte anspråk på användargenererat innehåll. BONKI:s personal läser inte individuella användarreflektioner.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">5. Data & integritet</h3>
              <p>BONKI skyddar dina personuppgifter i enlighet med GDPR.</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Data lagras säkert på EU-baserade servrar.</li>
                <li>Båda partners i ett parutrymme har tillgång till allt delat innehåll — du är medveten om att din partner kan se dina delade reflektioner.</li>
                <li>Du kan begära radering av alla dina data genom att kontakta BONKI.</li>
                <li>Vid kontoradering raderas alla personuppgifter permanent inom 30 dagar.</li>
                <li>BONKI säljer inte användardata till tredje part.</li>
                <li>BONKI använder inte ditt innehåll för reklam.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">6. Betalning & återbetalning</h3>
              <p>Still Us finns som ett engångsköp. Ett köp ger tillgång för båda partners. Alla köp är slutgiltiga förutom där tillämplig lag kräver annat. EU:s konsumentskyddslag ger 14 dagars ångerrätt för digitala produkter — denna rätt upphör när du börjar använda det köpta innehållet.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">7. Betatestning</h3>
              <p>Betaanvändare har godkänt separata betavillkor. Betaåtkomst utgör inte ett kommersiellt köp. Funktioner och innehåll kan ändras under betaperioden.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">8. Förbjuden användning</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Dela inte dina inloggningsuppgifter.</li>
                <li>Använd inte tjänsten för att trakassera, manipulera eller skada din partner.</li>
                <li>BONKI förbehåller sig rätten att stänga av konton som bryter mot dessa villkor.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">9. Ansvarsfriskrivning</h3>
              <p>Still Us är ett kommunikationsverktyg, inte en kristjänst. Om du upplever våld i nära relationer, psykisk kris eller relationsmissbruk — kontakta professionella tjänster.</p>
              <p className="mt-2">BONKI ansvarar inte för utfall av samtal, avbrott i tjänsten eller förlust av data utanför BONKI:s rimliga kontroll.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">10. Tillämplig lag</h3>
              <p>Dessa villkor regleras av svensk lag. Tvister ska lösas i svenska domstolar.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">11. Ändringar</h3>
              <p>BONKI kan uppdatera dessa villkor. Användare meddelas om väsentliga ändringar. Fortsatt användning innebär godkännande.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">12. Kontakt</h3>
              <p>Frågor om villkor eller begäran om dataradering: kontakta BONKI AB.</p>
            </section>

            <p className="text-xs text-muted-foreground/50 italic pt-2">Detta dokument bör granskas av juridisk rådgivare innan publicering.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif">{t('login.privacy_title')}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2 space-y-5 text-sm text-muted-foreground leading-relaxed">
            <p className="text-xs text-muted-foreground/60">Senast uppdaterad: Februari 2026</p>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">Vilka data samlar vi in?</h3>
              <p>E-postadress och namn vid registrering. Reflektioner och anteckningar du skapar i appen. Teknisk information för att tjänsten ska fungera (t.ex. enhetstyp).</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">Hur använder vi din data?</h3>
              <p>Enbart för att tillhandahålla tjänsten. Vi säljer inte din data, använder den inte för reklam och delar den inte med tredje part utöver vad som krävs för att driva tjänsten.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">Lagring</h3>
              <p>All data lagras säkert på EU-baserade servrar i enlighet med GDPR.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">Delat utrymme</h3>
              <p>Båda partners i ett parutrymme kan se delat innehåll. Privata anteckningar förblir privata.</p>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-foreground text-base mb-1">Dina rättigheter</h3>
              <p>Du har rätt att begära tillgång till, rättelse eller radering av dina personuppgifter. Kontakta BONKI AB för att utöva dessa rättigheter. Vid kontoradering raderas all data permanent inom 30 dagar.</p>
            </section>

            <p className="text-xs text-muted-foreground/50 italic pt-2">Detta dokument bör granskas av juridisk rådgivare innan publicering.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
