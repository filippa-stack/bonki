import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify caller is authenticated
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use service role for aggregate queries
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Run all queries in parallel - NO private text content exposed
    const [
      spacesRes,
      sessionsRes,
      completionsRes,
      reflectionsRes,
      notesRes,
      bookmarksRes,
      takeawaysRes,
      feedbackRes,
      visitsRes,
    ] = await Promise.all([
      // Total spaces
      supabase.from('couple_spaces').select('id', { count: 'exact', head: true }),

      // Sessions by status
      supabase.from('couple_sessions').select('status, started_at, ended_at'),

      // Step completions count
      supabase.from('couple_session_completions').select('id', { count: 'exact', head: true }),

      // Reflections by state (NO text)
      supabase.from('step_reflections').select('state, user_id'),

      // Notes by visibility (NO content)
      supabase.from('prompt_notes').select('visibility, user_id, is_highlight'),

      // Bookmarks count
      supabase.from('question_bookmarks').select('id, is_active', { count: 'exact' }),

      // Takeaways count (NO content)
      supabase.from('couple_takeaways').select('id', { count: 'exact', head: true }),

      // Beta feedback - this IS meant to be read
      supabase.from('beta_feedback').select('id, response_text, submitted_at, session_id').order('submitted_at', { ascending: false }).limit(50),

      // Card visits
      supabase.from('couple_card_visits').select('card_id, user_id'),
    ])

    // Aggregate sessions by status
    const sessionsByStatus: Record<string, number> = {}
    let totalSessionDurationMinutes = 0
    let completedSessionCount = 0
    if (sessionsRes.data) {
      for (const s of sessionsRes.data) {
        sessionsByStatus[s.status] = (sessionsByStatus[s.status] || 0) + 1
        if (s.status === 'completed' && s.ended_at && s.started_at) {
          const dur = (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000
          if (dur > 0 && dur < 600) { // sanity cap at 10h
            totalSessionDurationMinutes += dur
            completedSessionCount++
          }
        }
      }
    }

    // Aggregate reflections by state
    const reflectionsByState: Record<string, number> = {}
    const uniqueReflectionUsers = new Set<string>()
    if (reflectionsRes.data) {
      for (const r of reflectionsRes.data) {
        reflectionsByState[r.state] = (reflectionsByState[r.state] || 0) + 1
        if (r.state !== 'draft' || (reflectionsRes.data as any[]).some(
          x => x.user_id === r.user_id && x.state !== 'draft'
        )) {
          // Count users who have at least submitted something
        }
        uniqueReflectionUsers.add(r.user_id)
      }
    }

    // Aggregate notes
    const notesByVisibility: Record<string, number> = {}
    const uniqueNoteUsers = new Set<string>()
    let highlightCount = 0
    if (notesRes.data) {
      for (const n of notesRes.data) {
        notesByVisibility[n.visibility] = (notesByVisibility[n.visibility] || 0) + 1
        uniqueNoteUsers.add(n.user_id)
        if (n.is_highlight) highlightCount++
      }
    }

    // Aggregate bookmarks
    const activeBookmarks = bookmarksRes.data
      ? (bookmarksRes.data as any[]).filter((b: any) => b.is_active).length
      : 0

    // Aggregate card visits - top cards
    const cardVisitCounts: Record<string, number> = {}
    if (visitsRes.data) {
      for (const v of visitsRes.data) {
        cardVisitCounts[v.card_id] = (cardVisitCounts[v.card_id] || 0) + 1
      }
    }
    const topCards = Object.entries(cardVisitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cardId, count]) => ({ cardId, visits: count }))

    const analytics = {
      overview: {
        totalSpaces: spacesRes.count || 0,
        totalSessions: sessionsRes.data?.length || 0,
        totalCompletions: completionsRes.count || 0,
        totalTakeaways: takeawaysRes.count || 0,
      },
      sessions: {
        byStatus: sessionsByStatus,
        avgDurationMinutes: completedSessionCount > 0
          ? Math.round(totalSessionDurationMinutes / completedSessionCount)
          : 0,
      },
      reflections: {
        byState: reflectionsByState,
        totalReflections: reflectionsRes.data?.length || 0,
        uniqueUsers: uniqueReflectionUsers.size,
      },
      notes: {
        byVisibility: notesByVisibility,
        totalNotes: notesRes.data?.length || 0,
        uniqueUsers: uniqueNoteUsers.size,
        highlights: highlightCount,
      },
      bookmarks: {
        total: bookmarksRes.count || 0,
        active: activeBookmarks,
      },
      topCards,
      feedback: feedbackRes.data || [],
    }

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
