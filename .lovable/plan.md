

## Update Capacitor Config + Add Scripts

Capacitor v8 is already installed. Two small changes only.

### Change 1: `capacitor.config.ts`
Update `appId` from `app.lovable.1604837d627c4368a714aa6b770c1b8c` to `com.bonkistudio.bonki`. Keep everything else (appName, webDir, server block) unchanged.

### Change 2: `package.json`
Add two scripts to the `"scripts"` block:
```json
"cap:sync": "npx cap sync",
"cap:open:android": "npx cap open android"
```

### What stays untouched
- All dependencies (Capacitor v8.2.0 stays)
- `appName: 'BONKI'` stays
- Server config stays (preview URL for dev)
- All source files, components, configs

