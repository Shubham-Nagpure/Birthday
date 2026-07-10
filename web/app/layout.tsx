import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "wishtoria — Build a Surprise Website Gift in Minutes 🎁",
  description:
    "Create a personalized, animated surprise website for someone you love — birthday, anniversary, or just because.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Poppins:wght@400;500;600&family=Caveat:wght@500;600;700&family=Kalam:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
