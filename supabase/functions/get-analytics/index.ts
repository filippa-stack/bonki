import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Admin allow-list — who can VIEW the dashboard
const ADMIN_USER_IDS = [
  'b29f4c84-0426-4b8f-9293-dccf9141a4b5', // filippa@bonkistudio.com
  '8105cd94-be94-473e-977a-883e461cfea8', // bernhard.emma@gmail.com
  '999288dd-b73a-4829-9d0d-72a8b54b6385', // emma@bonkistudio.com
]

// Internal team + review + test accounts excluded from all metrics
const EXCLUDED_USER_IDS = [
  'b29f4c84-0426-4b8f-9293-dccf9141a4b5', // filippa@bonkistudio.com
  '8105cd94-be94-473e-977a-883e461cfea8', // bernhard.emma@gmail.com
  '999288dd-b73a-4829-9d0d-72a8b54b6385', // emma@bonkistudio.com
  'ca36b0ea-0a2f-460c-9a2a-067d308737b7', // filippa.cekander@bonkistudio.com
  'c1226be0-b15a-44d4-9e5a-ae1914529f9a', // ida@bonkistudio.com
  'd3ac01ff-325a-488f-8804-fdfb5577b76a', // sofia@bonkistudio.com
  'f05b6b17-d7b6-48f1-ae6d-77fe2ff28711', // apple.review@bonkistudio.com
  '3c53e146-47dc-47ec-9922-6251ca97708b', // play.review@bonkistudio.com
  'd13e0011-797a-4b87-8057-173e17f9bf70', // test@example.com
  '9533d524-6348-4ca2-831d-b8d6aaecab89', // filippa.bernhard@yahoo.com
  'ad3e00d5-5c4d-4fbb-a351-c208a9365a23', // filippa.bernhard@yahoomail.com
]

const dayKey = (d: Date) => d.toISOString().slice(0, 10)
const weekKey = (d: Date) => {
  // ISO week-year (yyyy-Www)
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = (t.getUTCDay() + 6) % 7
  t.setUTCDate(t.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4))
  const diff = (t.getTime() - firstThursday.getTime()) / 86400000
  const week = 1 + Math.round((diff - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
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

    if (!ADMIN_USER_IDS.includes(user.id)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const fromParam = url.searchParams.get('from')
    const fromDate = fromParam || null
    const productFilter = url.searchParams.get('product') || null
    const windowDays = Math.max(1, Math.min(365, parseInt(url.searchParams.get('window') || '30', 10)))
    const windowStart = new Date(Date.now() - windowDays * 86400000)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Spaces that contain any excluded user — exclude these spaces entirely
    const { data: teamMemberships } = await supabase
      .from('couple_members')
      .select('couple_space_id')
      .in('user_id', EXCLUDED_USER_IDS)
    const excludedSpaceIds = Array.from(new Set((teamMemberships || []).map((m: any) => m.couple_space_id)))

    const applyFrom = (q: any, col = 'created_at') =>
      fromDate ? q.gte(col, fromDate) : q

    const excludeTeam = (q: any, col = 'couple_space_id') => {
      for (const id of excludedSpaceIds) q = q.neq(col, id)
      return q
    }

    const excludeTeamUsers = (q: any, col = 'user_id') => {
      for (const id of EXCLUDED_USER_IDS) q = q.neq(col, id)
      return q
    }

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
      onboardingRes,
      productAccessRes,
      paidSpacesRes,
    ] = await Promise.all([
      excludeTeam(applyFrom(supabase.from('couple_spaces').select('id, created_at, paid_at')), 'id').range(0, 9999),
      applyProduct(excludeTeam(applyFrom(supabase.from('couple_sessions').select('id, status, started_at, ended_at, created_by, product_id, couple_space_id, card_id'), 'started_at'))).range(0, 9999),
      excludeTeam(applyFrom(supabase.from('couple_session_completions').select('id, session_id, user_id, completed_at'), 'completed_at')).range(0, 19999),
      excludeTeamUsers(applyProduct(excludeTeam(applyFrom(supabase.from('step_reflections').select('state, user_id, product_id, session_id, updated_at'), 'updated_at')))).range(0, 19999),
      excludeTeamUsers(excludeTeam(applyFrom(supabase.from('prompt_notes').select('visibility, user_id, is_highlight, created_at')))).range(0, 9999),
      applyProduct(excludeTeam(supabase.from('question_bookmarks').select('id, is_active, product_id'))).range(0, 9999),
      excludeTeam(applyFrom(supabase.from('couple_takeaways').select('id, session_id, created_at'), 'created_at')).range(0, 9999),
      excludeTeam(applyFrom(supabase.from('beta_feedback').select('id, response_text, submitted_at, session_id').order('submitted_at', { ascending: false }).limit(50), 'submitted_at')),
      excludeTeamUsers(excludeTeam(applyFrom(supabase.from('couple_card_visits').select('card_id, user_id, last_visited_at'), 'last_visited_at'))).range(0, 19999),
      excludeTeamUsers(supabase.from('couple_members').select('user_id, status, left_at, created_at, couple_space_id')).range(0, 9999),
      excludeTeamUsers(supabase.from('onboarding_events').select('user_id, event_type, created_at')).range(0, 19999),
      excludeTeamUsers(supabase.from('user_product_access').select('user_id, product_id, granted_at, granted_via')).range(0, 9999),
      excludeTeam(supabase.from('couple_spaces').select('id, paid_at, created_at').not('paid_at', 'is', null), 'id').range(0, 9999),
    ])

    const sessions = (sessionsRes.data || []) as any[]
    const filteredSessionIds = new Set(sessions.map((s: any) => s.id))

    // Sessions by status + duration
    const sessionsByStatus: Record<string, number> = {}
    let totalDur = 0, completedCount = 0
    const sessionsByProduct: Record<string, number> = {}
    for (const s of sessions) {
      sessionsByStatus[s.status] = (sessionsByStatus[s.status] || 0) + 1
      sessionsByProduct[s.product_id || 'unknown'] = (sessionsByProduct[s.product_id || 'unknown'] || 0) + 1
      if (s.status === 'completed' && s.ended_at && s.started_at) {
        const dur = (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000
        if (dur > 0 && dur < 600) { totalDur += dur; completedCount++ }
      }
    }

    const completions = (completionsRes.data || []) as any[]
    const filteredCompletions = productFilter
      ? completions.filter(c => filteredSessionIds.has(c.session_id))
      : completions

    const takeaways = (takeawaysRes.data || []) as any[]
    const filteredTakeaways = productFilter
      ? takeaways.filter(t => filteredSessionIds.has(t.session_id))
      : takeaways

    // Reflections
    const reflections = (reflectionsRes.data || []) as any[]
    const reflectionsByState: Record<string, number> = {}
    const uniqueReflectionUsers = new Set<string>()
    const reflectionsByProduct: Record<string, number> = {}
    for (const r of reflections) {
      reflectionsByState[r.state] = (reflectionsByState[r.state] || 0) + 1
      uniqueReflectionUsers.add(r.user_id)
      reflectionsByProduct[r.product_id || 'unknown'] = (reflectionsByProduct[r.product_id || 'unknown'] || 0) + 1
    }

    // Notes
    const notes = (notesRes.data || []) as any[]
    const notesByVisibility: Record<string, number> = {}
    const uniqueNoteUsers = new Set<string>()
    let highlightCount = 0
    for (const n of notes) {
      notesByVisibility[n.visibility] = (notesByVisibility[n.visibility] || 0) + 1
      uniqueNoteUsers.add(n.user_id)
      if (n.is_highlight) highlightCount++
    }

    const bookmarks = (bookmarksRes.data || []) as any[]
    const activeBookmarks = bookmarks.filter(b => b.is_active).length

    // Top cards
    const KIDS_PREFIXES = ['jim-', 'jma-', 'jiv-', 'vk-', 'sk-', 'sex-']
    const cardVisitCounts: Record<string, number> = {}
    const visits = (visitsRes.data || []) as any[]
    for (const v of visits) {
      if (productFilter) {
        const isKids = KIDS_PREFIXES.some(p => v.card_id?.startsWith(p))
        if (productFilter === 'still_us' && isKids) continue
        if (productFilter === 'kids' && !isKids) continue
      }
      cardVisitCounts[v.card_id] = (cardVisitCounts[v.card_id] || 0) + 1
    }
    const topCards = Object.entries(cardVisitCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([cardId, visits]) => ({ cardId, visits }))

    // ----- USERS / ACQUISITION -----
    const members = (membersRes.data || []) as any[]
    // First-seen per user via earliest membership created_at
    const firstSeen = new Map<string, string>()
    for (const m of members) {
      if (m.left_at) continue
      if (m.status !== 'active') continue
      const prev = firstSeen.get(m.user_id)
      if (!prev || new Date(m.created_at) < new Date(prev)) firstSeen.set(m.user_id, m.created_at)
    }
    const totalRealUsers = firstSeen.size

    // Daily signups for windowDays
    const signupsByDay: Record<string, number> = {}
    for (let i = 0; i < windowDays; i++) {
      const d = new Date(Date.now() - i * 86400000)
      signupsByDay[dayKey(d)] = 0
    }
    let newUsersInWindow = 0
    for (const ts of firstSeen.values()) {
      const d = new Date(ts)
      if (d >= windowStart) {
        newUsersInWindow++
        const k = dayKey(d)
        if (k in signupsByDay) signupsByDay[k]++
      }
    }
    const signupsTrend = Object.entries(signupsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    // ----- ENGAGEMENT (DAU/WAU/MAU + sessions per user) -----
    const allSessions = sessions // already excluded; use for engagement (all products if none selected)
    const dau = new Set<string>(), wau = new Set<string>(), mau = new Set<string>()
    const dayCutoff = new Date(Date.now() - 86400000)
    const weekCutoff = new Date(Date.now() - 7 * 86400000)
    const monthCutoff = new Date(Date.now() - 30 * 86400000)
    const userSessionDays = new Map<string, Set<string>>()
    const userSessionCount = new Map<string, number>()
    const dauTrendMap: Record<string, Set<string>> = {}
    for (let i = 0; i < windowDays; i++) {
      dauTrendMap[dayKey(new Date(Date.now() - i * 86400000))] = new Set<string>()
    }
    for (const s of allSessions) {
      if (!s.started_at || !s.created_by) continue
      const d = new Date(s.started_at)
      if (d >= monthCutoff) mau.add(s.created_by)
      if (d >= weekCutoff) wau.add(s.created_by)
      if (d >= dayCutoff) dau.add(s.created_by)
      userSessionCount.set(s.created_by, (userSessionCount.get(s.created_by) || 0) + 1)
      const dk = dayKey(d)
      if (!userSessionDays.has(s.created_by)) userSessionDays.set(s.created_by, new Set())
      userSessionDays.get(s.created_by)!.add(dk)
      if (dk in dauTrendMap) dauTrendMap[dk].add(s.created_by)
    }
    const dauTrend = Object.entries(dauTrendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, set]) => ({ date, count: set.size }))

    let returning = 0
    for (const days of userSessionDays.values()) if (days.size >= 2) returning++

    const activeUsers = userSessionCount.size
    const avgSessionsPerUser = activeUsers > 0
      ? Math.round((Array.from(userSessionCount.values()).reduce((a, b) => a + b, 0) / activeUsers) * 10) / 10
      : 0
    const avgReflectionsPerSession = sessions.length > 0
      ? Math.round((reflections.length / sessions.length) * 10) / 10
      : 0

    // ----- ACTIVATION FUNNEL -----
    const onboarding = (onboardingRes.data || []) as any[]
    const lobbyViewers = new Set<string>()
    const onboardingComplete = new Set<string>()
    for (const e of onboarding) {
      if (e.event_type === 'lobby_view') lobbyViewers.add(e.user_id)
      if (e.event_type === 'onboarding_complete') onboardingComplete.add(e.user_id)
    }
    const usersWithSession = new Set<string>(allSessions.map((s: any) => s.created_by).filter(Boolean))
    const usersWithCompletedSession = new Set<string>(
      allSessions.filter((s: any) => s.status === 'completed').map((s: any) => s.created_by).filter(Boolean)
    )
    const productAccess = (productAccessRes.data || []) as any[]
    const PAID_VIA = new Set(['purchase', 'stripe'])
    const BETA_VIA = new Set(['beta_grant', 'beta_migration', 'manual_grant'])
    const paidUsers = new Set<string>(productAccess.filter(p => PAID_VIA.has(p.granted_via)).map(p => p.user_id))
    const betaUsers = new Set<string>(productAccess.filter(p => BETA_VIA.has(p.granted_via)).map(p => p.user_id))
    const accessUsers = new Set<string>([...paidUsers, ...betaUsers])

    const accessBySource: Record<string, number> = {}
    for (const p of productAccess) {
      accessBySource[p.granted_via] = (accessBySource[p.granted_via] || 0) + 1
    }

    const funnel = [
      { step: 'Sett bibliotek', count: lobbyViewers.size },
      { step: 'Onboarding klar', count: onboardingComplete.size },
      { step: 'Startat samtal', count: usersWithSession.size },
      { step: 'Avslutat samtal', count: usersWithCompletedSession.size },
      { step: 'Tillgång (köpt eller beta)', count: accessUsers.size },
    ]

    // ----- MONETIZATION -----
    const allSpaces = (spacesRes.data || []) as any[]
    const paidSpaces = (paidSpacesRes.data || []) as any[]
    const newPaidInWindow = paidSpaces.filter(p => p.paid_at && new Date(p.paid_at) >= windowStart).length
    const spacesCreatedInWindow = allSpaces.filter(s => new Date(s.created_at) >= windowStart).length
    const conversionPct = spacesCreatedInWindow > 0
      ? Math.round((newPaidInWindow / spacesCreatedInWindow) * 1000) / 10
      : 0

    // ----- RETENTION (week W → W+1) -----
    const usersByCohortWeek = new Map<string, Set<string>>()
    for (const [uid, ts] of firstSeen.entries()) {
      const wk = weekKey(new Date(ts))
      if (!usersByCohortWeek.has(wk)) usersByCohortWeek.set(wk, new Set())
      usersByCohortWeek.get(wk)!.add(uid)
    }
    const completionsByUserWeek = new Map<string, Set<string>>() // userId -> set of weekKeys with completed session
    for (const s of allSessions) {
      if (s.status === 'completed' && s.ended_at && s.created_by) {
        const wk = weekKey(new Date(s.ended_at))
        if (!completionsByUserWeek.has(s.created_by)) completionsByUserWeek.set(s.created_by, new Set())
        completionsByUserWeek.get(s.created_by)!.add(wk)
      }
    }
    const retentionCohorts: { cohort: string; size: number; returnedW1: number; pct: number }[] = []
    const sortedCohorts = Array.from(usersByCohortWeek.keys()).sort().slice(-8)
    for (const cohortWk of sortedCohorts) {
      const users = usersByCohortWeek.get(cohortWk)!
      // compute next-week key
      const [yr, w] = cohortWk.split('-W').map(Number)
      const nextWk = `${yr}-W${String(w + 1).padStart(2, '0')}`
      let returned = 0
      for (const uid of users) {
        if (completionsByUserWeek.get(uid)?.has(nextWk)) returned++
      }
      retentionCohorts.push({
        cohort: cohortWk,
        size: users.size,
        returnedW1: returned,
        pct: users.size > 0 ? Math.round((returned / users.size) * 1000) / 10 : 0,
      })
    }

    const analytics = {
      meta: {
        environment: 'live',
        excludedUserCount: EXCLUDED_USER_IDS.length,
        excludedSpaceCount: excludedSpaceIds.length,
        windowDays,
        generatedAt: new Date().toISOString(),
      },
      overview: {
        totalRealUsers,
        totalSpaces: allSpaces.length,
        paidSpaces: paidSpaces.length,
        totalSessions: sessions.length,
        totalCompletions: filteredCompletions.length,
        totalTakeaways: filteredTakeaways.length,
      },
      acquisition: {
        newUsersInWindow,
        signupsTrend,
      },
      engagement: {
        dau: dau.size,
        wau: wau.size,
        mau: mau.size,
        avgSessionsPerUser,
        avgReflectionsPerSession,
        returningUsers: returning,
        dauTrend,
      },
      funnel,
      sessions: {
        byStatus: sessionsByStatus,
        byProduct: sessionsByProduct,
        avgDurationMinutes: completedCount > 0 ? Math.round(totalDur / completedCount) : 0,
      },
      reflections: {
        byState: reflectionsByState,
        byProduct: reflectionsByProduct,
        totalReflections: reflections.length,
        uniqueUsers: uniqueReflectionUsers.size,
      },
      notes: {
        byVisibility: notesByVisibility,
        totalNotes: notes.length,
        uniqueUsers: uniqueNoteUsers.size,
        highlights: highlightCount,
      },
      bookmarks: {
        total: bookmarks.length,
        active: activeBookmarks,
      },
      monetization: {
        paidSpaces: paidSpaces.length,
        newPaidInWindow,
        spacesCreatedInWindow,
        conversionPct,
        paidUsers: paidUsers.size,
        betaUsers: betaUsers.size,
        accessUsers: accessUsers.size,
        accessBySource,
      },
      retention: retentionCohorts,
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
