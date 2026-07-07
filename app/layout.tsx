import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MahaPoly Search",
  description: "Find which Maharashtra polytechnics and branches you qualify for based on real CAP cutoffs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
