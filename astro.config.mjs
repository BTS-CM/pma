import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

import starlight from "@astrojs/starlight";

export default defineConfig({
  output: 'static',
  outDir: "./astroDist",
  publicDir: './src/data',

  build: { format: 'file' },

  integrations: [
    react(),
    starlight({
      title: "Bitshares Prediction Market UI",
      sidebar: [
        { label: 'Overview', slug: 'docs/docs-index' },
        {
          label: "Getting Started",
          items: [
            'docs/supported-chains',
            'docs/wallet-connection',
            'docs/ui-navigation',
          ],
        },
        {
          label: "Prediction Markets",
          items: [
            'docs/browsing-predictions',
            'docs/understanding-predictions',
            'docs/creating-predictions',
            'docs/prediction-organizations',
            'docs/prediction-portfolio',
          ],
        },
        {
          label: "Trading",
          items: [
            'docs/the-dex',
            'docs/instant-trade',
            'docs/simple-swap',
          ],
        },
        {
          label: "Account & Assets",
          items: [
            'docs/transferring-assets',
            'docs/managing-portfolio',
            'docs/creating-accounts',
            'docs/nft-metadata',
          ],
        },
        {
          label: "Settings & Tools",
          items: [
            'docs/node-management',
            'docs/blocked-users',
            'docs/customizing-visuals',
            'docs/deep-linking',
          ],
        },
        {
          label: "Security & Privacy",
          items: [
            'docs/how-security-works',
            'docs/content-moderation',
          ],
        }
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});