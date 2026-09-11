import { Link } from "@tanstack/react-router";
import { AudioLines, House, ListMusic, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/" as const, label: "Home", icon: House },
  { to: "/exercises" as const, label: "Exercises", icon: ListMusic },
  { to: "/settings" as const, label: "Settings", icon: Settings },
];

export function AppHeader() {
  return (
    <header className="border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Alto home">
          <span className="grid size-9 place-items-center rounded-lg bg-foreground text-background shadow-sm"><AudioLines className="size-4" /></span>
          <span className="font-display text-xl font-medium">Alto</span>
          <span className="hidden text-[11px] font-semibold uppercase text-muted-foreground sm:inline">Practice studio</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="group flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>
              <Icon className={cn("size-4", label === "Home" && "sm:hidden")} />
              <span className={cn(label === "Home" && "hidden sm:inline")}>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
