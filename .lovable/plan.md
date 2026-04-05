

## Fix App Name from "Still Us" to "BONKI"

The Capacitor config file (`capacitor.config.ts`) has `appName: 'Still Us'` on line 5. This controls the name shown when installing the app.

### Change

**`capacitor.config.ts`** line 5:
- Change `appName: 'Still Us'` → `appName: 'BONKI'`

That's the only change needed. After publishing, the app will show "BONKI" during installation.

