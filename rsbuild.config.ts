import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";

export default defineConfig({
  html: {
    title: "Tide Focus",
    favicon: "./public/images/logo-rm.png",
    meta: {
      description: "Don't even waste a second.",
    },
  },
  plugins: [pluginReact()],
  resolve: {
    alias: {
      "@": "./src",
    },
  },
  tools: {
    rspack: {
      plugins: [
        tanstackRouter({
          target: "react",
          autoCodeSplitting: true,
        }),
      ],
    },
  },
});
