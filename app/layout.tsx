import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Team Coherence", description: "Employer-led relocation journeys for Abu Dhabi" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
