import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { i18n } from "lib/i18n";

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    i18n,
    nav: {
      title: locale === "kr" ? "Korean Docs" : "English Docs",
      url: `/${locale}`,
    },
    githubUrl: "https://github.com",
    links: [
      {
        type: "main",
        text: locale === "kr" ? "문서" : "Documentation",
        url: `/${locale}/docs`,
      },
    ],
  };
}
