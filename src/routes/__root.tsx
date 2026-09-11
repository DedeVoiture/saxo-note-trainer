import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Link, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/sax/AppHeader";
import appCss from "../styles.css?url";

function NotFoundComponent() { return <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 text-center"><div><p className="font-display text-8xl">404</p><h1 className="mt-2 text-xl font-semibold">That page is off the chart.</h1><Link to="/" className="mt-6 inline-block font-semibold text-primary">Return home</Link></div></main>; }
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }], links: [{ rel: "stylesheet", href: appCss }, { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Space+Grotesk:wght@400;500;600;700&display=swap" }, { rel: "icon", href: "/favicon.ico" }] }),
  shellComponent: RootShell, component: RootComponent, notFoundComponent: NotFoundComponent,
});
function RootShell({ children }: { children: ReactNode }) { return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() { const { queryClient } = Route.useRouteContext(); return <QueryClientProvider client={queryClient}><div className="min-h-screen bg-background text-foreground"><AppHeader /><Outlet /></div></QueryClientProvider>; }
