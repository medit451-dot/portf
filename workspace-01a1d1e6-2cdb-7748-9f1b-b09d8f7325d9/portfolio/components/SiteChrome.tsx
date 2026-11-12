"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WelcomeGate from "./WelcomeGate";
import type { Profile } from "@/lib/db";

export default function SiteChrome({
  profile,
  logoText,
  siteName,
  children,
}: {
  profile: Profile | null;
  logoText: string;
  siteName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar logoText={logoText} siteName={siteName} />}
      {!isAdmin && <WelcomeGate />}
      <main className={isAdmin ? "" : "min-h-screen"}>{children}</main>
      {!isAdmin && profile && <Footer profile={profile} logoText={logoText} />}
    </>
  );
}
