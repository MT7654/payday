import type { Metadata } from "next";
import "./globals.css";
import "./reward-journey.css";
import "./preference-flow.css";
import "./shop-guide.css";
import "./payday-assistant.css";
import "./design-system.css";

export const metadata: Metadata = {
  title: "Payday — A little something for you",
  description: "Celebrate your milestones. Discover a thoughtful reward, with AI and real community experiences.",
  icons: {
    icon: "/brand/payday-mark.png",
    shortcut: "/brand/payday-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import "./browser-interests.css";
