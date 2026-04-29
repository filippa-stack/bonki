import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { BarChart3, Users, MessageSquare, BookmarkCheck, FileText, Clock, ArrowLeft, CalendarIcon, TrendingUp, CreditCard, Repeat, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/Sparkline';

const ALLOWED_USER_IDS = [
  'b29f4c84-0426-4b8f-9293-dccf9141a4b5',
  '8105cd94-be94-473e-977a-883e461cfea8',
  '999288dd-b73a-4829-9d0d-72a8b54b6385',
];

interface Analytics {
  meta: { environment: string; excludedUserCount: number; excludedSpaceCount: number; windowDays: number; generatedAt: string };
  overview: { totalRealUsers: number; totalSpaces: number; paidSpaces: number; totalSessions: number; totalCompletions: number; totalTakeaways: number };
  acquisition: { newUsersInWindow: number; signupsTrend: { date: string; count: number }[] };
  engagement: { dau: number; wau: number; mau: number; avgSessionsPerUser: number; avgReflectionsPerSession: number; returningUsers: number; dauTrend: { date: string; count: number }[] };
  funnel: { step: string; count: number }[];
  sessions: { byStatus: Record<string, number>; byProduct: Record<string, number>; avgDurationMinutes: number };
  reflections: { byState: Record<string, number>; byProduct: Record<string, number>; totalReflections: number; uniqueUsers: number };
  notes: { byVisibility: Record<string, number>; totalNotes: number; uniqueUsers: number; highlights: number };
  bookmarks: { total: number; active: number };
  monetization: { paidSpaces: number; newPaidInWindow: number; spacesCreatedInWindow: number; conversionPct: number; paidUsers?: number; betaUsers?: number; accessUsers?: number; accessBySource?: Record<string, number> };
  retention: { cohort: string; size: number; returnedW1: number; pct: number }[];
  topCards: { cardId: string; visits: number }[];
  feedback: { id: string; response_text: string | null; submitted_at: string; session_id: string | null }[];
}

const statusLabels: Record<string, string> = { active: 'Aktiva', completed: 'Slutförda', abandoned: 'Avbrutna' };
const stateLabels: Record<string, string> = { draft: 'Utkast', ready: 'Redo', revealed: 'Visade', locked: 'Låsta' };
const productLabels: Record<string, string> = {
  still_us: 'Vårt Vi',
  jag_i_mig: 'Jag i mig',
  jag_med_andra: 'Jag med andra',
  jag_i_varlden: 'Jag i världen',
  syskonkort: 'Syskon',
  vardagskort: 'Vardag',
  sexualitetskort: 'Sexualitet',
};

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl bg-slate-900/80 border border-sky-400/30 p-4 space-y-1.5 shadow-[0_0_0_1px_rgba(56,189,248,0.08)]">
      <div className="flex items-center gap-2 text-sky-300">
        <Icon className="w-4 h-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white tabular-nums leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-300">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300 mt-8 mb-3 border-l-2 border-sky-400 pl-2">{children}</h2>;
}

function BreakdownRow({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-700/60 last:border-0">
      <div>
        <span className="text-sm text-white font-medium">{label}</span>
        {sub && <span className="text-xs text-slate-300 ml-2">{sub}</span>}
      </div>
      <span className="text-sm font-bold text-white tabular-nums">{value}</span>
    </div>
  );
}

function FunnelBar({ step, count, max, prevCount }: { step: string; count: number; max: number; prevCount?: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const conv = prevCount && prevCount > 0 ? Math.round((count / prevCount) * 1000) / 10 : null;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline text-sm">
        <span className="text-white font-medium">{step}</span>
        <span className="tabular-nums">
          <span className="font-bold text-white">{count}</span>
          {conv !== null && <span className="text-sky-300 text-xs font-semibold ml-2">{conv}%</span>}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-700/60">
        <div className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date>(new Date('2026-02-01'));
  const [productFilter, setProductFilter] = useState<string>('all');
  const [windowDays, setWindowDays] = useState<number>(30);

  useEffect(() => {
    if (!user || !ALLOWED_USER_IDS.includes(user.id)) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateStr = format(fromDate, 'yyyy-MM-dd');
        const productParam = productFilter !== 'all' ? `&product=${productFilter}` : '';
        const { data: result, error: fnError } = await supabase.functions.invoke(
          `get-analytics?from=${dateStr}&window=${windowDays}${productParam}`
        );
        if (fnError) throw fnError;
        setData(result as Analytics);
      } catch (err: any) {
        setError(err.message || 'Kunde inte hämta data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, fromDate, productFilter, windowDays]);

  if (authLoading) return null;
  if (!user || !ALLOWED_USER_IDS.includes(user.id)) return <Navigate to="/" replace />;

  const funnelMax = data ? Math.max(1, ...data.funnel.map(f => f.count)) : 1;

  return (
    <div className="min-h-screen page-bg">
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-accent">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground">Analytics</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              {(() => {
                const url = import.meta.env.VITE_SUPABASE_URL || '';
                const isLive = url.includes('wcienwozdurwhswaarjy') === false; // test ref
                return (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${isLive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {isLive ? 'LIVE' : 'TEST'}
                  </span>
                );
              })()}
              <span>interna konton exkluderade</span>
              {data && <span>• {data.meta.excludedUserCount} användare, {data.meta.excludedSpaceCount} spaces filtrerade</span>}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 pb-12 max-w-2xl mx-auto">
        {/* Filters */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Allt sedan:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start text-left font-normal gap-2">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(fromDate, 'yyyy-MM-dd')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={fromDate} onSelect={(d) => d && setFromDate(d)} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground ml-2">Fönster:</span>
            {[7, 14, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setWindowDays(d)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                  windowDays === d ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {d}d
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { value: 'all', label: 'Alla' },
              { value: 'still_us', label: 'Vårt Vi' },
              { value: 'kids', label: 'Barn' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setProductFilter(opt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  productFilter === opt.value ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="pt-8 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/20 animate-pulse" />)}
          </div>
        )}

        {error && <div className="mt-8 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}

        {data && (
          <>
            <SectionTitle>Översikt</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users} label="Riktiga användare" value={data.overview.totalRealUsers} />
              <StatCard icon={Users} label="Par (spaces)" value={data.overview.totalSpaces} />
              <StatCard icon={CreditCard} label="Betalande par" value={data.overview.paidSpaces} sub={data.overview.totalSpaces > 0 ? `${Math.round((data.overview.paidSpaces / data.overview.totalSpaces) * 1000) / 10}% av alla` : ''} />
              <StatCard icon={BarChart3} label="Sessioner" value={data.overview.totalSessions} />
              <StatCard icon={Clock} label="Snittid / session" value={data.sessions.avgDurationMinutes > 0 ? `${data.sessions.avgDurationMinutes} min` : '–'} />
              <StatCard icon={FileText} label="Takeaways" value={data.overview.totalTakeaways} />
            </div>

            <SectionTitle>Anskaffning ({windowDays}d)</SectionTitle>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard icon={TrendingUp} label="Nya användare" value={data.acquisition.newUsersInWindow} />
              <StatCard icon={Users} label="Totalt riktiga" value={data.overview.totalRealUsers} />
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              <div className="text-xs text-muted-foreground mb-2">Dagliga registreringar</div>
              <div className="text-foreground/70"><Sparkline data={data.acquisition.signupsTrend} /></div>
            </div>

            <SectionTitle>Aktivering – funnel</SectionTitle>
            <div className="rounded-xl bg-card border border-border/50 p-4 space-y-4">
              {data.funnel.map((f, i) => (
                <FunnelBar key={f.step} step={f.step} count={f.count} max={funnelMax} prevCount={i > 0 ? data.funnel[i - 1].count : undefined} />
              ))}
            </div>

            <SectionTitle>Engagemang</SectionTitle>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatCard icon={Activity} label="DAU" value={data.engagement.dau} />
              <StatCard icon={Activity} label="WAU" value={data.engagement.wau} />
              <StatCard icon={Activity} label="MAU" value={data.engagement.mau} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard icon={Repeat} label="Återkommande" value={data.engagement.returningUsers} sub="≥2 dagar med session" />
              <StatCard icon={MessageSquare} label="Reflektioner / session" value={data.engagement.avgReflectionsPerSession} />
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              <div className="text-xs text-muted-foreground mb-2">DAU senaste {windowDays} dagar</div>
              <div className="text-foreground/70"><Sparkline data={data.engagement.dauTrend} /></div>
            </div>

            <SectionTitle>Monetisering & tillgång</SectionTitle>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard icon={CreditCard} label={`Nya köp (${windowDays}d)`} value={data.monetization.newPaidInWindow} />
              <StatCard icon={CreditCard} label="Konvertering" value={`${data.monetization.conversionPct}%`} sub={`av ${data.monetization.spacesCreatedInWindow} nya spaces`} />
              <StatCard icon={CreditCard} label="Betalande användare" value={data.monetization.paidUsers ?? 0} sub="purchase + stripe" />
              <StatCard icon={CreditCard} label="Beta-testare" value={data.monetization.betaUsers ?? 0} sub="beta + manual grant" />
            </div>
            {data.monetization.accessBySource && Object.keys(data.monetization.accessBySource).length > 0 && (
              <div className="rounded-xl bg-card border border-border/50 p-4 mb-3">
                <div className="text-xs text-muted-foreground mb-2">Tillgång per källa (rader i user_product_access)</div>
                {Object.entries(data.monetization.accessBySource)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, n]) => (
                    <BreakdownRow key={src} label={src} value={n} />
                  ))}
              </div>
            )}

            <SectionTitle>Retention (kohort → vecka +1)</SectionTitle>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              {data.retention.length === 0 && <p className="text-sm text-muted-foreground">Ingen data ännu</p>}
              {data.retention.map(r => (
                <BreakdownRow key={r.cohort} label={r.cohort} sub={`${r.returnedW1} av ${r.size}`} value={`${r.pct}%`} />
              ))}
            </div>

            <SectionTitle>Sessioner per status</SectionTitle>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              {Object.entries(data.sessions.byStatus).map(([s, c]) => (
                <BreakdownRow key={s} label={statusLabels[s] || s} value={c} />
              ))}
              {Object.keys(data.sessions.byStatus).length === 0 && <p className="text-sm text-muted-foreground">Ingen data ännu</p>}
            </div>

            <SectionTitle>Sessioner per produkt</SectionTitle>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              {Object.entries(data.sessions.byProduct)
                .sort((a, b) => b[1] - a[1])
                .map(([p, c]) => (
                  <BreakdownRow key={p} label={productLabels[p] || p} value={c} />
                ))}
            </div>

            <SectionTitle>Reflektioner (anonymiserat)</SectionTitle>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard icon={MessageSquare} label="Totalt" value={data.reflections.totalReflections} />
              <StatCard icon={Users} label="Unika skribenter" value={data.reflections.uniqueUsers} />
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              {Object.entries(data.reflections.byState).map(([s, c]) => (
                <BreakdownRow key={s} label={stateLabels[s] || s} value={c} />
              ))}
            </div>

            <SectionTitle>Anteckningar (anonymiserat)</SectionTitle>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard icon={FileText} label="Totalt" value={data.notes.totalNotes} />
              <StatCard icon={Users} label="Unika skribenter" value={data.notes.uniqueUsers} />
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              {Object.entries(data.notes.byVisibility).map(([v, c]) => (
                <BreakdownRow key={v} label={v === 'private' ? 'Privata' : v === 'shared' ? 'Delade' : v} value={c} />
              ))}
              <BreakdownRow label="Highlights" value={data.notes.highlights} />
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              ⚠️ Textinnehåll i privata anteckningar visas aldrig här – bara antal.
            </p>

            <SectionTitle>Bokmärken</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={BookmarkCheck} label="Totalt" value={data.bookmarks.total} />
              <StatCard icon={BookmarkCheck} label="Aktiva" value={data.bookmarks.active} />
            </div>

            {data.topCards.length > 0 && (
              <>
                <SectionTitle>Populäraste kort (besök)</SectionTitle>
                <div className="rounded-xl bg-card border border-border/50 p-4">
                  {data.topCards.map(({ cardId, visits }) => (
                    <BreakdownRow key={cardId} label={cardId} value={visits} />
                  ))}
                </div>
              </>
            )}

            {data.feedback.length > 0 && (
              <>
                <SectionTitle>Beta-feedback (senaste)</SectionTitle>
                <div className="space-y-3">
                  {data.feedback.map(fb => (
                    <div key={fb.id} className="rounded-xl bg-card border border-border/50 p-4">
                      <p className="text-sm text-foreground">{fb.response_text || '(tom)'}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(fb.submitted_at).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-8 p-4 rounded-xl bg-accent/30 border border-border/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Integritetsnot:</strong> Detta dashboard visar enbart aggregerad, anonymiserad data.
                Inga personliga anteckningar, reflektionstexter eller identifierbar användarinformation exponeras.
                Beta-feedback visas då det skickas in explicit som feedback till oss.
                Interna konton ({data.meta.excludedUserCount} st) och deras spaces är exkluderade från all statistik.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
