// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://nexo-flow-crm.vercel.app/",
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "DM Sans",
      provider: fontProviders.google(),
      cssVariable: "--font-dm-sans",
      weights: [300, 400, 500, 700],
      subsets: ["latin"],
      styles: ["normal"],
      display: "swap",
      formats: ["woff2"],
      fallbacks: ["sans-serif"],
    },
  ],
});
