// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// Site URL for canonical / OG (set PUBLIC_SITE_URL on Render to your landing domain)
const site =
  process.env.PUBLIC_SITE_URL?.trim() ||
  "http://localhost:4321";

// https://astro.build/config
export default defineConfig({
  site,
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
