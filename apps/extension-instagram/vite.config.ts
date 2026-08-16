import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// MV3 build: popup is a regular HTML entry, the background service worker
// is a separate ES module entry. No content-script/page-access logic yet —
// that is out of scope for P001.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/background/background.ts"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
