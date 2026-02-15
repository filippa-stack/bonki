import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PENDING_TOKEN_KEY = 'still-us-pending-invite-token';
const PENDING_CODE_KEY = 'still-us-pending-invite-code';
const PENDING_NAME_KEY = 'still-us-pending-invite-name';

export type InviteClaimStatus = 'idle' | 'claiming' | 'success' | 'error';

/** Store invite params to localStorage so they survive OAuth redirects. */
export function storePendingInvite(token?: string | null, code?: string | null, name?: string) {
  if (token) localStorage.setItem(PENDING_TOKEN_KEY, token);
  if (code) localStorage.setItem(PENDING_CODE_KEY, code);
  if (name) localStorage.setItem(PENDING_NAME_KEY, name);
}

export function getPendingInviteToken(): string | null {
  return localStorage.getItem(PENDING_TOKEN_KEY);
}

export function getPendingInviteCode(): string | null {
  return localStorage.getItem(PENDING_CODE_KEY);
}

export function clearPendingInvite() {
  localStorage.removeItem(PENDING_TOKEN_KEY);
  localStorage.removeItem(PENDING_CODE_KEY);
  localStorage.removeItem(PENDING_NAME_KEY);
}

export function hasPendingInvite(): boolean {
  return !!(localStorage.getItem(PENDING_TOKEN_KEY) || localStorage.getItem(PENDING_CODE_KEY));
}

/**
 * Hook that auto-claims a pending invite after login.
 * Returns claim status so the UI can show a spinner or error.
 */
export function usePendingInviteClaim() {
  const { user } = useAuth();
  const [status, setStatus] = useState<InviteClaimStatus>('idle');
  const [errorType, setErrorType] = useState<string>('');
  const claimAttempted = useRef(false);

  const claim = useCallback(async () => {
    const token = localStorage.getItem(PENDING_TOKEN_KEY);
    const code = localStorage.getItem(PENDING_CODE_KEY);
    const name = localStorage.getItem(PENDING_NAME_KEY);

    if (!token && !code) return false;
    if (!user) return false;

    setStatus('claiming');
    setErrorType('');

    try {
      const body: Record<string, string> = {};
      if (token) body.invite_token = token;
      else if (code) body.invite_code = code;
      if (name) body.partner_name = name;

      const res = await supabase.functions.invoke('join-couple-space', { body });

      if (res.error) {
        const parsed = typeof res.error === 'string' ? { error: res.error } : res.error;
        setStatus('error');
        setErrorType((parsed as any)?.error || 'unknown');
        return false;
      }

      const data = res.data as any;
      if (data?.success) {
        clearPendingInvite();
        setStatus('success');
        return true;
      } else {
        setStatus('error');
        setErrorType(data?.error || 'unknown');
        return false;
      }
    } catch (err) {
      console.error('Invite claim error:', err);
      setStatus('error');
      setErrorType('network');
      return false;
    }
  }, [user]);

  // Auto-claim on mount when user is available
  useEffect(() => {
    if (!user || claimAttempted.current) return;
    if (!hasPendingInvite()) return;

    claimAttempted.current = true;
    claim();
  }, [user, claim]);

  const retry = useCallback(() => {
    claimAttempted.current = false;
    claim();
  }, [claim]);

  return { status, errorType, retry, hasPending: hasPendingInvite() };
}
