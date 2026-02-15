import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JOIN_INTENT_KEY } from '@/pages/Index';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Shield } from 'lucide-react';
import bonkiLogo from '@/assets/bonki-logo.png';

interface PurchaseScreenProps {
  onPurchaseComplete: () => void;
}

export default function PurchaseScreen({ onPurchaseComplete }: PurchaseScreenProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handlePurchase = async () => {
    setProcessing(true);
    // Mock processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCompleted(true);
    // Brief pause to show success state
    await new Promise((resolve) => setTimeout(resolve, 1200));
    onPurchaseComplete();
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        <img src={bonkiLogo} alt="Still Us" className="h-12 w-auto mx-auto" />

        <div className="space-y-3">
          <h1 className="text-display text-foreground">
            {t('purchase.title', 'Ert gemensamma utrymme')}
          </h1>
          <p className="text-body text-muted-foreground leading-relaxed">
            {t('purchase.subtitle', 'Ett engångsköp låser upp ert gemensamma utrymme för två. Din partner betalar inte.')}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: 0.05 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-4 text-left"
        >
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              {t('purchase.benefit_1', 'Tillgång till alla samtalsområden och reflektioner')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              {t('purchase.benefit_2', 'Bjud in din partner utan extra kostnad')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              {t('purchase.benefit_3', 'Ert privata utrymme — för alltid')}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: 0.08 }}
          className="space-y-3"
        >
          <Button
            onClick={handlePurchase}
            disabled={processing || completed}
            className="w-full h-12 text-base font-medium gap-2"
          >
            {completed ? (
              <>
                <Check className="w-5 h-5" />
                {t('purchase.complete', 'Klart!')}
              </>
            ) : processing ? (
              <span className="animate-pulse">{t('purchase.processing', 'Behandlar...')}</span>
            ) : (
              t('purchase.buy_button', 'Lås upp för 299 kr')
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>{t('purchase.secure_note', 'Säker betalning · Engångsköp')}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => { localStorage.setItem(JOIN_INTENT_KEY, 'true'); navigate('/join'); }}
            className="text-muted-foreground hover:text-foreground"
          >
            Jag har redan blivit inbjuden
          </Button>

          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Har du redan blivit inbjuden? Då behöver du inte köpa igen — anslut med länken eller koden.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
