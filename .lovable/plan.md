

## Fix: DevState not activating on preview domain

### Change (1 file)

**`src/lib/devTools.ts` — `isPreviewEnvironment()` function**

Add `.lovableproject.com` to the recognized preview domains:

```typescript
return host === 'localhost'
  || host.includes('preview--')
  || host.endsWith('.lovableproject.com')
  || host.endsWith('.local');
```

### Result
All `devState` values — `onboarding`, `productIntro`, `library`, `diary`, `browse`, etc. — will work on the sandbox preview domain. Production domains (`bonkiapp.com`, `bonki.lovable.app`) remain explicitly blocked.

