import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";

const DEFAULT_SITE_URL = "https://tide-focus-web.vercel.app";

const rawSiteUrl =
  process.env.PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  DEFAULT_SITE_URL;

const siteUrl = rawSiteUrl.startsWith("http")
  ? rawSiteUrl
  : `https://${rawSiteUrl}`;

const siteTitle = "Tide Focus | Focus timer for deep work and calmer workdays";

const siteDescription =
  "Tide Focus is a focus timer for deep work with timer and stopwatch sessions, wave-based categories, ambient sound, and lightweight session review.";

const siteImage = `${siteUrl}/images/logo-rm.png`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tide Focus",
  url: siteUrl,
  description: siteDescription,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  image: siteImage,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Focus timer and stopwatch",
    "Wave-based focus categories",
    "Ambient waves audio during sessions",
    "Session review and analytics",
  ],
};

export default defineConfig({
  html: {
    title: siteTitle,
    favicon: "./public/images/logo-rm.png",
    meta: {
      description: siteDescription,
      keywords:
        "focus timer, deep work app, productivity timer, online stopwatch, session tracking, pomodoro alternative",
      robots: "index, follow",
      author: "Tide Focus",
      "theme-color": {
        name: "theme-color",
        content: "#02367b",
      },
      "application-name": {
        name: "application-name",
        content: "Tide Focus",
      },
      "apple-mobile-web-app-title": {
        name: "apple-mobile-web-app-title",
        content: "Tide Focus",
      },
      "og:title": {
        property: "og:title",
        content: siteTitle,
      },
      "og:description": {
        property: "og:description",
        content: siteDescription,
      },
      "og:type": {
        property: "og:type",
        content: "website",
      },
      "og:url": {
        property: "og:url",
        content: siteUrl,
      },
      "og:image": {
        property: "og:image",
        content: siteImage,
      },
      "og:image:alt": {
        property: "og:image:alt",
        content: "Tide Focus ocean wave logo",
      },
      "og:site_name": {
        property: "og:site_name",
        content: "Tide Focus",
      },
      "twitter:card": {
        name: "twitter:card",
        content: "summary_large_image",
      },
      "twitter:title": {
        name: "twitter:title",
        content: siteTitle,
      },
      "twitter:description": {
        name: "twitter:description",
        content: siteDescription,
      },
      "twitter:image": {
        name: "twitter:image",
        content: siteImage,
      },
    },
    tags: [
      {
        tag: "link",
        attrs: {
          rel: "canonical",
          href: siteUrl,
        },
        head: true,
      },
      {
        tag: "link",
        attrs: {
          rel: "manifest",
          href: "/site.webmanifest",
        },
        head: true,
      },
      {
        tag: "script",
        attrs: {
          type: "application/ld+json",
        },
        children: JSON.stringify(structuredData),
        head: true,
      },
    ],
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
