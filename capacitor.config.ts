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
        iOSClientId: '629196806647-960ga3kinh5v280ft77rpn04artkeqnc.apps.googleusercontent.com',
        // iOSServerClientId MUST equal webClientId — this is the audience Supabase
        // verifies against when signInWithIdToken is called on iOS. Without it,
        // sign-ins succeed at Google but fail at Supabase verify (aud mismatch).
        // Do not "simplify" away.
        iOSServerClientId: '629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com',
        mode: 'online'
      }
    }
  }
};

export default config;
