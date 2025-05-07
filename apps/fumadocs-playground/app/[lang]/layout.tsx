import "fumadocs-ui/style.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
});

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <RootProvider
          i18n={{
            locale: lang,
            locales: [
              {
                name: "English",
                locale: "en",
              },
              {
                name: "Korean",
                locale: "kr",
              },
            ],
            translations: {
              kr: {
                toc: "목차",
                search: "문서 검색",
                lastUpdate: "마지막 업데이트",
                searchNoResult: "검색 결과 없음",
                previousPage: "이전 페이지",
                nextPage: "다음 페이지",
                chooseLanguage: "언어 선택",
              },
            }[lang],
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
