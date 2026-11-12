import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/Toast";
import SiteChrome from "@/components/SiteChrome";
import { getProfile, getSettings } from "@/lib/db";

export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = getSettings();
    const profile = getProfile();
    const title = settings.seo_title || settings.site_name || `${profile.name} — ${profile.title}`;
    const description = settings.seo_description || settings.site_description || profile.bio;
    return {
      title,
      description,
      openGraph: { title, description, type: "website", images: settings.og_image ? [{ url: settings.og_image }] : [] },
      icons: settings.favicon ? { icon: settings.favicon } : undefined,
    };
  } catch {
    return { title: "Portfolio", description: "Developer Portfolio" };
  }
}

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let profile: ReturnType<typeof getProfile> | null = null;
  let settings: Record<string, string> = {};
  try { profile = getProfile(); settings = getSettings(); } catch {}
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <LangProvider>
          <ToastProvider>
            <SiteChrome
              profile={profile}
              logoText={settings.logo_text || "medit"}
              siteName={settings.site_name || ""}
            >
              {children}
            </SiteChrome>
          </ToastProvider>
        </LangProvider>
      </body>
    </html>
  );
}
