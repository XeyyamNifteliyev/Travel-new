import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelAZ — Səyahətiniz bir yerdə başlayır",
  description: "Bilet, otel, tur, blog və viza məlumatları — hər şey bir yerdə",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
