import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.snapmacros.app',
  appName: 'SnapMacros',
  webDir: 'out',

  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#09090F',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#09090F',
    },
    Camera: {
      saveToGallery: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
