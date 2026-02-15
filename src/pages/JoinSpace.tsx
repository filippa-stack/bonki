import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import bonkiLogo from '@/assets/bonki-logo.png';
import { storePendingInvite, clearPendingInvite } from '@/hooks/usePendingInvite';

type JoinState = 'loading' | 'name_prompt' | 'joining' | 'success' | 'error';

export default function JoinSpace() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { refreshCoupleSpace, setOverrideCoupleSpaceId } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const inviteToken = searchParams.get('token');
  const [inviteCode, setInviteCode] = useState(searchParams.get('code') || '');
  const [partnerName, setPartnerName] = useState('');
  const [state, setState] = useState<JoinState>('name_prompt');
  const [errorType, setErrorType] = useState<string>('');
  const [showCodeInput] = useState(true);

  // Persist invite params to localStorage immediately so they survive OAuth redirects
  useEffect(() => {
    if (inviteToken || inviteCode) {
      storePendingInvite(inviteToken, inviteCode);
    }
  }, [inviteToken, inviteCode]);

  const handleJoin = async () => {
    if (!user) return;
    setState('joining');

    // Also store partner name before calling
    if (partnerName.trim()) {
      storePendingInvite(null, null, partnerName.trim());
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        setState('error');
        setErrorType('no_session');
        return;
      }

      const body: Record<string, string> = {};
      if (inviteToken) body.invite_token = inviteToken;
      else if (inviteCode.trim()) body.invite_code = inviteCode.trim();
      if (partnerName.trim()) body.partner_name = partnerName.trim();

      const res = await supabase.functions.invoke('join-couple-space', {
        body,
      });

      if (res.error) {
        const parsed = typeof res.error === 'string' ? { error: res.error } : res.error;
        setState('error');
        setErrorType((parsed as any)?.error || 'unknown');
        return;
      }

      const data = res.data as any;
      if (data?.success) {
        clearPendingInvite();
        setState('success');
        setOverrideCoupleSpaceId(data.couple_space_id);
        try {
          await refreshCoupleSpace();
        } catch (refreshErr) {
          console.error('refreshCoupleSpace failed (override still active):', refreshErr);
        }
        navigate('/', { replace: true });
      } else {
        setState('error');
        setErrorType(data?.error || 'unknown');
      }
    } catch (err) {
      console.error('Join error:', err);
      setState('error');
      setErrorType('network');
    }
  };

  const errorMessages: Record<string, string> = {
    invalid_invite: t('join.error_invalid_invite', 'Inbjudningslänken är ogiltig eller har gått ut.'),
    space_full: t('join.error_space_full', 'Det här utrymmet har redan två medlemmar.'),
    no_session: t('join.error_no_session', 'Du behöver logga in först.'),
    network: t('join.error_network', 'Något gick fel. Försök igen.'),
    unknown: t('join.error_unknown', 'Något gick fel. Försök igen.'),
  };

  if (state === 'loading' || state === 'joining') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-body text-gentle">
            {state === 'joining' ? t('join.joining', 'Kopplar ihop er…') : t('join.loading', 'Laddar...')}
          </p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-sm"
        >
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-display text-foreground">{t('join.success_title', 'Ni är anslutna')}</h1>
          <p className="text-body text-gentle">{t('join.success_subtitle', 'Ert gemensamma utrymme är redo.')}</p>
        </motion.div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6 max-w-sm"
        >
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-body text-foreground">{errorMessages[errorType] || errorMessages.unknown}</p>
          <div className="space-y-3">
            <Button onClick={() => setState('name_prompt')} className="w-full">
              {t('general.start', 'Försök igen')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/', { replace: true })} className="w-full">
              {t('join.go_home', 'Gå till startsidan')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // name_prompt state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        <img src={bonkiLogo} alt="Still Us" className="h-12 w-auto mx-auto" />
        
        <div className="space-y-3">
          <h1 className="text-display text-foreground">
            {t('join.title', 'Anslut till din partner')}
          </h1>
          <p className="text-body text-gentle">
            {t('join.subtitle', 'Ange koden eller öppna länken du fick. Du behöver inte köpa igen.')}
          </p>
        </div>

        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <Label>{t('join.your_name', 'Ditt namn (valfritt)')}</Label>
            <Input
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder={t('join.name_placeholder', 'Vad ska din partner kalla dig?')}
            />
          </div>

          {showCodeInput && (
            <div className="space-y-2">
              <Label>{t('join.invite_code', 'Inbjudningskod')}</Label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="text-center tracking-widest text-lg font-mono"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleJoin}
          className="w-full h-12 text-base font-medium"
          disabled={!inviteToken && !inviteCode.trim()}
        >
          {t('join.connect_button', 'Anslut')}
        </Button>

      </motion.div>
    </div>
  );
}
