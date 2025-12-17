import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caliph.attendance',
  appName: 'Caliph Attendance',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'https://86da93dc-7774-4c11-9003-f25d08749aa9-00-29ylpyw3w6jpf.picard.replit.dev',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
