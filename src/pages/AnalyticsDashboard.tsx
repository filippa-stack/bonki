import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { BarChart3, Users, MessageSquare, BookmarkCheck, FileText, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Analytics {
  overview: {
    totalSpaces: number;
    totalSessions: number;
    totalCompletions: number;
    totalTakeaways: number;
  };
  sessions: {
    byStatus: Record<string, number>;
    avgDurationMinutes: number;
  };
  reflections: {
    byState: Record<string, number>;
    totalReflections: number;
    uniqueUsers: number;
  };
  notes: {
    byVisibility: Record<string, number>;
    totalNotes: number;
    uniqueUsers: number;
    highlights: number;
  };
  bookmarks: {
    total: number;
    active: number;
  };
  topCards: { cardId: string; visits: number }[];
  feedback: { id: string; response_text: string | null; submitted_at: string; session_id: string | null }[];
}

const statusLabels: Record<string, string> = {
  active: 'Aktiva',
  completed: 'Slutförda',
  abandoned: 'Avbrutna',
};

const stateLabels: Record<string, string> = {
  draft: 'Utkast',
  ready: 'Redo',
  revealed: 'Visade',
  locked: 'Låsta',
};

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

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke('get-analytics');
        if (fnError) throw fnError;
        setData(result as Analytics);
      } catch (err: any) {
        setError(err.message || 'Kunde inte hämta data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen page-bg">
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-accent">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-foreground">Analytics Dashboard</h1>
            <p className="text-xs text-muted-foreground">Anonymiserad användardata</p>
          </div>
        </div>
      </header>

      <main className="px-4 pb-12 max-w-2xl mx-auto">
        {loading && (
          <div className="pt-12 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Overview */}
            <SectionTitle>Översikt</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users} label="Par (spaces)" value={data.overview.totalSpaces} />
              <StatCard icon={BarChart3} label="Sessioner" value={data.overview.totalSessions} />
              <StatCard icon={Clock} label="Snittid / session" value={data.sessions.avgDurationMinutes > 0 ? `${data.sessions.avgDurationMinutes} min` : '–'} />
              <StatCard icon={FileText} label="Takeaways" value={data.overview.totalTakeaways} />
            </div>

            {/* Sessions */}
            <SectionTitle>Sessioner per status</SectionTitle>
            <div className="rounded-xl bg-card border border-border/50 p-4">
              {Object.entries(data.sessions.byStatus).map(([status, count]) => (
                <BreakdownRow key={status} label={statusLabels[status] || status} value={count} />
              ))}
              {Object.keys(data.sessions.byStatus).length === 0 && (
                <p className="text-sm text-muted-foreground">Ingen data ännu</p>
              )}
            </div>

            {/* Reflections – anonymous */}
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

            {/* Notes – anonymous */}
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

            {/* Bookmarks */}
            <SectionTitle>Bokmärken</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={BookmarkCheck} label="Totalt" value={data.bookmarks.total} />
              <StatCard icon={BookmarkCheck} label="Aktiva" value={data.bookmarks.active} />
            </div>

            {/* Top cards */}
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

            {/* Beta feedback – content IS shown here */}
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
