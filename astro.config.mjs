import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// Static site generated at build time from farukcan.dev/api.json.
export default defineConfig({
  site: "https://farukcan.dev",
  output: "static",
  // global.css already includes @tailwind base/components/utilities.
  integrations: [tailwind({ applyBaseStyles: false })],
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "old.farukcan.dev",
      },
    ],
  },
});
