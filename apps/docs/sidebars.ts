import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  playbookSidebar: [
    {
      type: "doc",
      id: "intro",
      label: "Overview",
    },
    {
      type: "category",
      label: "Architecture Principles",
      items: [
        "architecture/layered-architecture",
        "architecture/dependency-rules",
        "architecture/service-boundaries",
      ],
    },
    {
      type: "category",
      label: "API Standards",
      items: [
        "api/rest-conventions",
        "api/error-handling",
        "api/versioning",
      ],
    },
    {
      type: "category",
      label: "Testing Standards",
      items: [
        "testing/unit-testing",
        "testing/integration-testing",
        "testing/coverage",
      ],
    },
    {
      type: "category",
      label: "Security Standards",
      items: [
        "security/secrets-management",
        "security/log-sanitization",
        "security/configuration",
      ],
    },
    {
      type: "category",
      label: "Rule Catalog",
      items: [
        {
          type: "category",
          label: "Architecture Rules",
          items: [
            "rules/ARCH-001",
            "rules/ARCH-002",
            "rules/ARCH-003",
            "rules/ARCH-004",
          ],
        },
        {
          type: "category",
          label: "API Rules",
          items: [
            "rules/API-001",
            "rules/API-002",
            "rules/API-003",
            "rules/API-004",
          ],
        },
        {
          type: "category",
          label: "Testing Rules",
          items: [
            "rules/TEST-001",
            "rules/TEST-002",
            "rules/TEST-003",
            "rules/TEST-004",
          ],
        },
        {
          type: "category",
          label: "Security Rules",
          items: [
            "rules/SEC-001",
            "rules/SEC-002",
            "rules/SEC-003",
          ],
        },
        {
          type: "category",
          label: "Naming Rules",
          items: [
            "rules/NAME-001",
            "rules/NAME-002",
            "rules/NAME-003",
          ],
        },
      ],
    },
    {
      type: "doc",
      id: "how-it-works",
      label: "How ArchStandards Works",
    },
    {
      type: "doc",
      id: "configuration-reference",
      label: "Configuration Reference",
    },
  ],
};

export default sidebars;
