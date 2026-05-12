import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bonkistudio.bonkiapp',
  appName: 'BONKI',
  webDir: 'dist',
  server: {},
  plugins: {
    SocialLogin: {
      google: {
        webClientId: '629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com',
        mode: 'online'
      }
    }
  }
};

export default config;
