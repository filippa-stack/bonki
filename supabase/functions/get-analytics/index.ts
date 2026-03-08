import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_USER_ID = 'b29f4c84-0426-4b8f-9293-dccf9141a4b5'

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

    if (user.id !== ADMIN_USER_ID) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const fromParam = url.searchParams.get('from')
    const fromDate = fromParam || null
    const productFilter = url.searchParams.get('product') || null // 'still_us', 'kids', or null (all)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Exclude admin spaces from all queries
    const { data: adminMemberships } = await supabase
      .from('couple_members')
      .select('couple_space_id')
      .eq('user_id', ADMIN_USER_ID)
    const adminSpaceIds = (adminMemberships || []).map((m: any) => m.couple_space_id)

    const applyFrom = (q: any, col = 'created_at') =>
      fromDate ? q.gte(col, fromDate) : q

    const excludeAdminSpaces = (q: any, col = 'couple_space_id') => {
      for (const id of adminSpaceIds) {
        q = q.neq(col, id)
      }
      return q
    }

    // Product filtering helper for tables with product_id column
    const applyProduct = (q: any) => {
      if (!productFilter) return q
      if (productFilter === 'still_us') return q.eq('product_id', 'still_us')
      if (productFilter === 'kids') return q.neq('product_id', 'still_us')
      return q.eq('product_id', productFilter)
    }

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
      membersRes,
    ] = await Promise.all([
      applyFrom(supabase.from('couple_spaces').select('id', { count: 'exact', head: true })),
      applyProduct(applyFrom(supabase.from('couple_sessions').select('id, status, started_at, ended_at, product_id'), 'started_at')),
      applyFrom(supabase.from('couple_session_completions').select('id, session_id', { count: 'exact' }), 'completed_at'),
      applyProduct(applyFrom(supabase.from('step_reflections').select('state, user_id, product_id'), 'updated_at')),
      applyFrom(supabase.from('prompt_notes').select('visibility, user_id, is_highlight')),
      applyProduct(supabase.from('question_bookmarks').select('id, is_active', { count: 'exact' })),
      applyFrom(supabase.from('couple_takeaways').select('id, session_id', { count: 'exact' }), 'created_at'),
      applyFrom(supabase.from('beta_feedback').select('id, response_text, submitted_at, session_id').order('submitted_at', { ascending: false }).limit(50), 'submitted_at'),
      applyFrom(supabase.from('couple_card_visits').select('card_id, user_id'), 'last_visited_at'),
      supabase.from('couple_members').select('user_id, status, left_at'),
    ])

    // Build set of session IDs matching product filter (for filtering completions/takeaways)
    const filteredSessionIds = new Set<string>()
    if (sessionsRes.data) {
      for (const s of sessionsRes.data) {
        filteredSessionIds.add(s.id)
      }
    }

    // Aggregate sessions
    const sessionsByStatus: Record<string, number> = {}
    let totalSessionDurationMinutes = 0
    let completedSessionCount = 0
    if (sessionsRes.data) {
      for (const s of sessionsRes.data) {
        sessionsByStatus[s.status] = (sessionsByStatus[s.status] || 0) + 1
        if (s.status === 'completed' && s.ended_at && s.started_at) {
          const dur = (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000
          if (dur > 0 && dur < 600) {
            totalSessionDurationMinutes += dur
            completedSessionCount++
          }
        }
      }
    }

    // Filter completions by session IDs
    let filteredCompletionCount = 0
    if (productFilter && completionsRes.data) {
      for (const c of completionsRes.data as any[]) {
        if (filteredSessionIds.has(c.session_id)) filteredCompletionCount++
      }
    } else {
      filteredCompletionCount = completionsRes.count || (completionsRes.data as any[])?.length || 0
    }

    // Filter takeaways by session IDs
    let filteredTakeawayCount = 0
    if (productFilter && takeawaysRes.data) {
      for (const t of takeawaysRes.data as any[]) {
        if (filteredSessionIds.has(t.session_id)) filteredTakeawayCount++
      }
    } else {
      filteredTakeawayCount = takeawaysRes.count || (takeawaysRes.data as any[])?.length || 0
    }

    // Aggregate reflections
    const reflectionsByState: Record<string, number> = {}
    const uniqueReflectionUsers = new Set<string>()
    if (reflectionsRes.data) {
      for (const r of reflectionsRes.data) {
        reflectionsByState[r.state] = (reflectionsByState[r.state] || 0) + 1
        uniqueReflectionUsers.add(r.user_id)
      }
    }

    // Aggregate notes (no product_id on prompt_notes — show regardless)
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

    const activeBookmarks = bookmarksRes.data
      ? (bookmarksRes.data as any[]).filter((b: any) => b.is_active).length
      : 0

    // Top cards — filter by product using card_id prefix heuristic
    const KIDS_PREFIXES = ['jim-', 'jma-', 'jiv-', 'vk-', 'sk-', 'sex-']
    const cardVisitCounts: Record<string, number> = {}
    if (visitsRes.data) {
      for (const v of visitsRes.data) {
        if (productFilter) {
          const isKidsCard = KIDS_PREFIXES.some(p => v.card_id.startsWith(p))
          if (productFilter === 'still_us' && isKidsCard) continue
          if (productFilter === 'kids' && !isKidsCard) continue
        }
        cardVisitCounts[v.card_id] = (cardVisitCounts[v.card_id] || 0) + 1
      }
    }
    const topCards = Object.entries(cardVisitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cardId, count]) => ({ cardId, visits: count }))

    // Unique users
    const uniqueActiveMembers = new Set<string>()
    if (membersRes.data) {
      for (const m of membersRes.data) {
        if (m.status === 'active' && !m.left_at) {
          uniqueActiveMembers.add(m.user_id)
        }
      }
    }

    const analytics = {
      overview: {
        totalSpaces: spacesRes.count || 0,
        totalSessions: sessionsRes.data?.length || 0,
        totalCompletions: filteredCompletionCount,
        totalTakeaways: filteredTakeawayCount,
        uniqueUsers: uniqueActiveMembers.size,
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