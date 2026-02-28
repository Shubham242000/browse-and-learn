import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx, type ManifestV3Export } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" with { type: "json" };

const extensionManifest: ManifestV3Export = manifest;

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: extensionManifest })
  ]
});
