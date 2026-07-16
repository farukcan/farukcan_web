import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// Static site generated at build time from farukcan.dev/api.json.
export default defineConfig({
  site: "https://farukcan.dev",
  output: "static",
  integrations: [tailwind()],
});
