import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mentoria Hub — Твой центр учёбы и роста",
  description:
    "Персонализированная платформа для учеников 8-11 класса. Возможности, курсы, AI-дорожная карта и Telegram-напоминания.",
};

// Applied before paint so every route (not just pages that mount the theme
// toggle) reflects the saved theme immediately on hard navigation/refresh.
const themeInitScript = `
try {
  var raw = localStorage.getItem('mentoria_theme');
  var theme = raw ? JSON.parse(raw) : 'dark';
  if (theme === 'light') document.documentElement.classList.add('theme-light');
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-black font-outfit">{children}</body>
    </html>
  );
}
