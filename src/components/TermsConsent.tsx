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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{t('login.terms_title')}</DialogTitle>
          </DialogHeader>
          <p className="text-body text-gentle">{t('login.terms_placeholder')}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{t('login.privacy_title')}</DialogTitle>
          </DialogHeader>
          <p className="text-body text-gentle">{t('login.privacy_placeholder')}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
