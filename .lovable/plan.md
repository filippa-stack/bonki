## Fix: Illustration Bottom Fade Cutting Through Logo

### Problem
The 120px gradient overlay sits inside the illustration container and obscures the bottom of the logo, creating an ugly "erased then reappearing" effect below "UTVECKLAT AV PSYKOLOG". Not premium.

### Solution (single file: `src/components/Onboarding.tsx`)

**Move the gradient fade outside the illustration container** and position it as a bridge between the illustration and the text content. This way the logo stays fully visible and the fade only darkens the gap *below* the illustration.

1. **Remove** the inner gradient `<div>` from inside the `<motion.div>` illustration container (lines 81–91)
2. **Add** the same gradient div as a **sibling** between the illustration `<motion.div>` and the content `<div>`, positioned with `marginTop: '-120px'` and `position: 'relative'`, `zIndex: 2` so it overlaps the bottom edge of the illustration zone without being clipped by it
3. Keep the same gradient values (`height: 120px`, same background) — just repositioned

This ensures the logo renders fully, while the text area still has a smooth fade-in from the dark background.