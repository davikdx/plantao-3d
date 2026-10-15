import type { CapacitorConfig } from "@capacitor/cli";

// Sem server.url: o APK carrega somente os arquivos locais de dist/.
const config: CapacitorConfig = {
  appId: "br.app.plantao3d",
  appName: "Plantão 3D",
  webDir: "dist",
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: false
    }
  }
};

export default config;
