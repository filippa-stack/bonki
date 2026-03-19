/**
 * TestModePanel — Floating time-machine debug panel for pre-launch QA.
 * Only renders when sessionStorage testmode === 'true'.
 * REMOVE BEFORE LAUNCH.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isTestMode } from '@/lib/testMode';
import { completeSliderCheckin, SliderCheckinParams } from '@/lib/stillUsRpc';

interface CoupleState {
  couple_id: string;
  current_card_index: number;
  current_touch: string;
  phase: string;
  cycle_id: number;
  purchase_status: string;
  partner_tier: string;
  dissolved_at: string | null;
  initiator_id: string;
  partner_id: string | null;
  tier_2_pseudo_id: string | null;
  maintenance_card_index: number;
  partner_link_token: string | null;
}

interface NotifRow {
  notification_type: string;
  scheduled_at: string;
  sent_at: string | null;
  content: Record<string, unknown>;
}

function generateDummySliders(): { slider_id: string; position: number }[] {
  return [
    { slider_id: 's1', position: 15 + Math.floor(Math.random() * 70) },
    { slider_id: 's2', position: 15 + Math.floor(Math.random() * 70) },
    { slider_id: 's3', position: 15 + Math.floor(Math.random() * 70) },
  ];
}

export default function TestModePanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<CoupleState | null>(null);
  const [notifications, setNotifications] = useState<NotifRow[]>([]);
  const [busy, setBusy] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Fetch state
  const fetchState = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('couple_state')
      .select('*')
      .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
      .is('dissolved_at', null)
      .maybeSingle();
    if (data) setState(data as unknown as CoupleState);
  }, [user?.id]);

  // Fetch notifications
  const fetchNotifs = useCallback(async () => {
    if (!state?.couple_id) return;
    const { data } = await supabase
      .from('notification_queue')
      .select('notification_type, scheduled_at, sent_at, content')
      .eq('couple_id', state.couple_id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data as unknown as NotifRow[]);
  }, [state?.couple_id]);

  useEffect(() => {
    if (!isTestMode()) return;
    fetchState();
    intervalRef.current = setInterval(fetchState, 5000);
    return () => clearInterval(intervalRef.current);
  }, [fetchState]);

  useEffect(() => {
    if (expanded) fetchNotifs();
  }, [expanded, fetchNotifs, state]);

  if (!isTestMode() || !user) return null;

  // ── Actions ──
  const updateCoupleState = async (updates: Record<string, unknown>) => {
    if (!state) return;
    setBusy(true);
    await supabase
      .from('couple_state')
      .update(updates as any)
      .eq('couple_id', state.couple_id);
    await fetchState();
    setBusy(false);
  };

  const jumpToCard = async (cardIndex: number, isTillbaka: boolean) => {
    if (!state) return;
    setBusy(true);
    if (isTillbaka) {
      await updateCoupleState({
        phase: 'maintenance',
        maintenance_card_index: cardIndex,
        current_touch: 'slider_checkin',
      });
    } else {
      await updateCoupleState({
        phase: 'program',
        current_card_index: cardIndex,
        current_touch: 'slider_checkin',
      });
      // Create session_state row
      const cardId = `card_${cardIndex + 1}`;
      await supabase.rpc('insert_session_state_idempotent', {
        p_couple_id: state.couple_id,
        p_card_id: cardId,
        p_cycle_id: state.cycle_id,
        p_session_type: 'program',
        p_current_step: 'oppna',
        p_session_2_completed: false,
      });
    }
    setBusy(false);
    navigate('/?product=still-us');
  };

  const setPhase = async (phase: string) => {
    if (!state) return;
    const updates: Record<string, unknown> = { phase };
    if (phase === 'maintenance') {
      updates.maintenance_card_index = 0;
      updates.current_touch = 'slider_checkin';
    }
    if (phase === 'second_cycle') {
      updates.phase = 'program';
      updates.cycle_id = state.cycle_id + 1;
      updates.current_card_index = 0;
      updates.current_touch = 'slider_checkin';
    }
    await updateCoupleState(updates);
    navigate('/?product=still-us');
  };

  const setTouch = async (touch: string) => {
    await updateCoupleState({ current_touch: touch });
  };

  const simulatePartner = async () => {
    if (!state) return;
    setBusy(true);
    const cardId = `card_${state.current_card_index + 1}`;
    const pseudoId = state.tier_2_pseudo_id || 'test-partner';
    const params: SliderCheckinParams = {
      couple_id: state.couple_id,
      card_id: cardId,
      slider_responses: generateDummySliders(),
      link_token: state.partner_link_token || undefined,
    };
    // For tier_2, use the edge function with link_token
    // For tier_1 with real partner, we still use the edge function
    await completeSliderCheckin(params);
    await fetchState();
    setBusy(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 99999,
        fontFamily: 'monospace',
        fontSize: '13px',
      }}
    >
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            backgroundColor: '#2E2233', border: '1px solid #E8913A44',
            color: '#E8913A', fontSize: '18px', cursor: 'pointer',
          }}
          aria-label="Öppna testpanel"
        >
          🔧
        </button>
      ) : (
        <div
          style={{
            width: 340,
            maxHeight: '80vh',
            overflow: 'auto',
            backgroundColor: '#2E2233',
            border: '1px solid #E8913A33',
            borderRadius: 12,
            padding: 14,
            color: '#F5E6D3',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: '#E8913A', fontWeight: 700, fontSize: 14 }}>🔧 Tidsmaskin</span>
            <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', color: '#9B8E7E', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          {/* State Inspector */}
          {state && (
            <Section title="State">
              <Row label="couple_id" value={state.couple_id.slice(0, 12) + '…'} />
              <Row label="card_index" value={String(state.current_card_index)} />
              <Row label="touch" value={state.current_touch} />
              <Row label="phase" value={state.phase} />
              <Row label="cycle_id" value={String(state.cycle_id)} />
              <Row label="purchase" value={state.purchase_status} />
              <Row label="partner_tier" value={state.partner_tier} />
              <Row label="dissolved" value={state.dissolved_at ? 'YES' : 'no'} />
            </Section>
          )}

          {/* Jump to Card */}
          <Section title="Hoppa till kort">
            <select
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                if (v.startsWith('t_')) {
                  jumpToCard(parseInt(v.replace('t_', ''), 10), true);
                } else {
                  jumpToCard(parseInt(v, 10), false);
                }
              }}
              style={selectStyle}
              disabled={busy}
            >
              <option value="">Välj vecka…</option>
              {Array.from({ length: 22 }, (_, i) => (
                <option key={i} value={i}>Vecka {i + 1}</option>
              ))}
              {Array.from({ length: 12 }, (_, i) => (
                <option key={`t${i}`} value={`t_${i}`}>Tillbaka {i + 1}</option>
              ))}
            </select>
          </Section>

          {/* Phase Override */}
          <Section title="Fas">
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['program', 'ceremony', 'maintenance', 'second_cycle'].map((p) => (
                <PillButton
                  key={p}
                  label={p}
                  active={state?.phase === p}
                  onClick={() => setPhase(p)}
                  disabled={busy}
                />
              ))}
            </div>
          </Section>

          {/* Touch Advance */}
          <Section title="Touch">
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['slider_checkin', 'session_1', 'session_2', 'complete'].map((t) => (
                <PillButton
                  key={t}
                  label={t.replace('slider_checkin', 'slider')}
                  active={state?.current_touch === t}
                  onClick={() => setTouch(t)}
                  disabled={busy}
                />
              ))}
            </div>
          </Section>

          {/* Simulate Partner */}
          <Section title="Partner-sim">
            <button
              onClick={simulatePartner}
              disabled={busy}
              style={{
                ...btnStyle,
                opacity: busy ? 0.5 : 1,
              }}
            >
              {busy ? 'Simulerar…' : 'Simulera partners check-in'}
            </button>
          </Section>

          {/* Notification Log */}
          <Section title={`Notiser (${notifications.length})`}>
            {notifications.length === 0 ? (
              <span style={{ color: '#9B8E7E', fontSize: 11 }}>Inga notiser</span>
            ) : (
              <div style={{ maxHeight: 140, overflow: 'auto' }}>
                {notifications.map((n, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #5C446633', padding: '4px 0', fontSize: 11 }}>
                    <span style={{ color: '#E8913A' }}>{n.notification_type}</span>
                    {' · '}
                    <span style={{ color: '#9B8E7E' }}>{new Date(n.scheduled_at).toLocaleString('sv-SE')}</span>
                    {n.sent_at && <span style={{ color: '#8BA888' }}> ✓</span>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: '#9B8E7E', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '1px 0' }}>
      <span style={{ color: '#9B8E7E' }}>{label}</span>
      <span style={{ color: '#F5E6D3' }}>{value}</span>
    </div>
  );
}

function PillButton({ label, active, onClick, disabled }: { label: string; active?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '4px 10px',
        borderRadius: 8,
        border: active ? '1px solid #E8913A' : '1px solid #5C446666',
        backgroundColor: active ? '#E8913A22' : 'transparent',
        color: active ? '#E8913A' : '#B5A898',
        fontSize: 11,
        fontFamily: 'monospace',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: 8,
  border: '1px solid #5C446666',
  backgroundColor: '#2E2233',
  color: '#F5E6D3',
  fontSize: 12,
  fontFamily: 'monospace',
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #E8913A44',
  backgroundColor: '#E8913A22',
  color: '#E8913A',
  fontSize: 12,
  fontFamily: 'monospace',
  cursor: 'pointer',
};
