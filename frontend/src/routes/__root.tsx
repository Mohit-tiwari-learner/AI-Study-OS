import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="nm-flat max-w-md text-center p-10">
        <h1 className="text-7xl font-display font-bold text-primary">404</h1>
        <h2 className="mt-3 text-xl font-display font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That route doesn't exist in AI Study OS.
        </p>
        <div className="mt-6">
          <Link to="/dashboard" className="nm-button inline-flex px-5 py-2.5 text-sm font-semibold text-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Study OS — Smart notes, plans & doubts" },
      { name: "description", content: "AI-powered productivity OS for students: voice notes, summaries, study plans, and instant doubt-solving." },
      { property: "og:title", content: "AI Study OS" },
      { property: "og:description", content: "Voice→Notes, Summaries, Study Plans and Doubt Solver — all in one." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://api.fontshare.com/v2/css?f[]=satoshi@500,600,700&f[]=general-sans@500,600,700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syncopate:wght@400;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});

import { AuthProvider } from "@/contexts/AuthContext";

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
