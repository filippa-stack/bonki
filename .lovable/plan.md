

## Fix: Install page standalone redirect + login link prominence

**File:** `src/pages/Install.tsx` — two changes

### Change 1 — Redirect to `/login` instead of `/` (line 54-56)

The existing standalone check already redirects, but to `/`. Change it to `/login`.

```typescript
// FROM:
if (isStandalone()) {
  return <Navigate to="/" replace />;
}

// TO:
if (isStandalone()) {
  return <Navigate to="/login" replace />;
}
```

### Change 2 — Make login link more prominent (lines 349-354)

Increase font size and opacity on the "Redan medlem?" text and link.

```typescript
// FROM:
<p style={{ fontSize: '14px', color: 'rgba(245,237,210,0.5)', margin: 0 }}>
  Redan medlem?{' '}
  <Link to="/login" style={{ color: 'rgba(253, 246, 227, 0.7)', textDecoration: 'underline' }}>
    Logga in
  </Link>
</p>

// TO:
<p style={{ fontSize: '15px', color: 'rgba(245,237,210,0.65)', margin: 0 }}>
  Redan medlem?{' '}
  <Link to="/login" style={{ color: 'rgba(253, 246, 227, 0.85)', textDecoration: 'underline', fontWeight: 600 }}>
    Logga in
  </Link>
</p>
```

Nothing else changes.

