import { Link, useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Think" },
  { to: "/decisions", label: "Decisions" },
  { to: "/brains", label: "Brains" },
  { to: "/roundtables", label: "Roundtables" },
] as const;

export function SiteNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative inline-flex size-7 items-center justify-center rounded-full border border-ember/60">
            <span className="size-2.5 rounded-full bg-ember" />
          </span>
          <span className="font-display text-lg tracking-tight">Borrowed Brain</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/auth" })}>
              Sign in
            </Button>
          )}
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => navigate({ to: "/" })}>
            New decision
          </Button>
          <button
            className="inline-flex size-9 items-center justify-center rounded-md md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <div className={cn("border-t border-border/70 md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col px-5 py-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm text-muted-foreground hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
