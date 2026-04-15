

## Temporarily Remove IAR Script to Test Buy Flow

### Hypothesis
The Auditzy in-app redirect script may be interfering with the `/buy` page flow (e.g., redirecting users away before they can complete login/checkout).

### Change
**File:** `index.html`

Comment out the IAR script tag (lines ~46-50):

```html
<!-- IAR script temporarily disabled for /buy debugging
<script
  id="iar"
  src="https://rum.auditzy.com/teUjBCLn-bonkiapp.com-iar.js"
  async
></script>
-->
```

### Files Modified
- `index.html` (1 block commented out)

### After Testing
If `/buy?product=jag_i_mig` works without the script, we re-enable it with a path exclusion — either by conditionally loading it only on non-`/buy` routes, or by adding the script dynamically via JS with a path check.

