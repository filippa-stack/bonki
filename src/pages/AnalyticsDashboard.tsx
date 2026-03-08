import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { BarChart3, Users, MessageSquare, BookmarkCheck, FileText, Clock, ArrowLeft, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const ALLOWED_USER_IDS = [
  'b29f4c84-0426-4b8f-9293-dccf9141a4b5',
  '8105cd94-be94-473e-977a-883e461cfea8',
  '999288dd-b73a-4829-9d0d-72a8b54b6385',
];

interface Analytics {
  overview: { totalSpaces: number; totalSessions: number; totalCompletions: number; totalTakeaways: number; uniqueUsers: number };
  sessions: { byStatus: Record<string, number>; avgDurationMinutes: number };
  reflections: { byState: Record<string, number>; totalReflections: number; uniqueUsers: number };
  notes: { byVisibility: Record<string, number>; totalNotes: number; uniqueUsers: number; highlights: number };
  bookmarks: { total: number; active: number };
  topCards: { cardId: string; visits: number }[];
  feedback: { id: string; response_text: string | null; submitted_at: string; session_id: string | null }[];
}

const statusLabels: Record<string, string> = { active: 'Aktiva', completed: 'Slutförda', abandoned: 'Avbrutna' };
const stateLabels: Record<string, string> = { draft: 'Utkast', ready: 'Redo', revealed: 'Visade', locked: 'Låsta' };

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl bg-card border border-border/50 p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-3">{children}</h2>;
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground tabular-nums">{value}</span>
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

  useEffect(() => {
    if (!user || !ALLOWED_USER_IDS.includes(user.id)) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateStr = format(fromDate, 'yyyy-MM-dd');
        const productParam = productFilter !== 'all' ? `&product=${productFilter}` : '';
        const { data: result, error: fnError } = await supabase.functions.invoke(
          `get-analytics?from=${dateStr}${productParam}`
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
  }, [user, fromDate, productFilter]);

  if (authLoading) return null;
  if (!user || !ALLOWED_USER_IDS.includes(user.id)) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen page-bg">
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-accent">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground">Analytics Dashboard</h1>
            <p className="text-xs text-muted-foreground">Anonymiserad användardata</p>
          </div>
        </div>
      </header>

      <main className="px-4 pb-12 max-w-2xl mx-auto">
        {/* Filters */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Från:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal gap-2")}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(fromDate, 'yyyy-MM-dd')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={(d) => d && setFromDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { value: 'all', label: 'Alla' },
              { value: 'still_us', label: 'Still Us' },
              { value: 'kids', label: 'Barn' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setProductFilter(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  productFilter === opt.value
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="pt-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {data && (
          <>
            <SectionTitle>Översikt</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users} label="Unika användare" value={data.overview.uniqueUsers} />
              <StatCard icon={Users} label="Par (spaces)" value={data.overview.totalSpaces} />
              <StatCard icon={BarChart3} label="Sessioner" value={data.overview.totalSessions} />
              <StatCard icon={Clock} label="Snittid / session" value={data.sessions.avgDurationMinutes > 0 ? `${data.sessions.avgDurationMinutes} min` : '–'} />
              <StatCard icon={FileText} label="Takeaways" value={data.overview.totalTakeaways} />
            </div>

            <SectionTitle>Sessioner per status</SectionTitle>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              {Object.entries(data.sessions.byStatus).map(([status, count]) => (
                <BreakdownRow key={status} label={statusLabels[status] || status} value={count} />
              ))}
              {Object.keys(data.sessions.byStatus).length === 0 && (
                <p className="text-sm text-muted-foreground">Ingen data ännu</p>
              )}
            </div>

            <SectionTitle>Reflektioner (anonymiserat)</SectionTitle>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard icon={MessageSquare} label="Totalt" value={data.reflections.totalReflections} />
              <StatCard icon={Users} label="Unika skribenter" value={data.reflections.uniqueUsers} />
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              {Object.entries(data.reflections.byState).map(([state, count]) => (
                <BreakdownRow key={state} label={stateLabels[state] || state} value={count} />
              ))}
            </div>

            <SectionTitle>Anteckningar (anonymiserat)</SectionTitle>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard icon={FileText} label="Totalt" value={data.notes.totalNotes} />
              <StatCard icon={Users} label="Unika skribenter" value={data.notes.uniqueUsers} />
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              {Object.entries(data.notes.byVisibility).map(([vis, count]) => (
                <BreakdownRow key={vis} label={vis === 'private' ? 'Privata' : vis === 'shared' ? 'Delade' : vis} value={count} />
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
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
