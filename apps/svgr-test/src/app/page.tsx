"use client";

import { useTheme } from "next-themes";
import NextIcon from "../../public/next.svg";
import ReactIcon from "../../public/globe.svg";

export default function Home() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      {/* Local SVG from `public/next.svg` */}
      <NextIcon width={200} height={200} />

      {/* Remote SVG from external URL */}
      <ReactIcon width={200} height={200} />

      <button
        onClick={toggleTheme}
        className="mt-4 rounded-md border px-4 py-2 text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Toggle to {theme === "dark" ? "Light" : "Dark"} Theme
      </button>
    </main>
  );
}
