import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "ArchStandards",
  tagline: "Policy-as-code architecture governance platform for engineering teams",
  favicon: "img/favicon.ico",
  url: "https://docs.archstandards.dev",
  baseUrl: "/",
  organizationName: "Ashutosh-Yadav-256",
  projectName: "archstandards",
  onBrokenLinks: "warn",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/", // Serve the docs at the site's root
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/archstandards-social-card.jpg",
    navbar: {
      title: "ArchStandards",
      items: [
        {
          type: "docSidebar",
          sidebarId: "playbookSidebar",
          position: "left",
          label: "Engineering Playbook",
        },
        {
          href: "https://github.com/Ashutosh-Yadav-256/archstandards",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Playbook",
          items: [
            { label: "Architecture", to: "/architecture/layered-architecture" },
            { label: "API Standards", to: "/api/rest-conventions" },
            { label: "Testing", to: "/testing/unit-testing" },
            { label: "Security", to: "/security/secrets-management" },
          ],
        },
        {
          title: "Platform",
          items: [
            { label: "Rule Catalog", to: "/rules/ARCH-001" },
            { label: "How It Works", to: "/how-it-works" },
            { label: "Configuration", to: "/configuration-reference" },
          ],
        },
        {
          title: "Community",
          items: [
            { label: "GitHub", href: "https://github.com/Ashutosh-Yadav-256/archstandards" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ArchStandards. Built with Docusaurus.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
