import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bonkistudio.bonki',
  appName: 'BONKI',
  webDir: 'dist',
  server: {
    url: 'https://1604837d-627c-4368-a714-aa6b770c1b8c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
