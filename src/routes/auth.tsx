import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Borrowed Brain" },
      { name: "description", content: "Save your decisions, review them later, and keep your roundtables." },
      { property: "og:title", content: "Sign in to Borrowed Brain" },
      { property: "og:description", content: "Keep your decisions and review how they turned out." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/decisions";
}

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: safePath(search.redirect) });
  }, [loading, user, navigate, search.redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const redirectPath = safePath(search.redirect);
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${redirectPath}` },
        });
        if (error) throw error;
        toast.success("Account created.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: redirectPath });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      sessionStorage.setItem("bb:redirect", safePath(search.redirect));
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed.");
        return;
      }
      if (result.redirected) return;
      navigate({ to: safePath(search.redirect) });
    } catch {
      toast.error("Google sign-in failed.");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <h1 className="text-3xl">{mode === "signin" ? "Welcome back" : "Keep your decisions"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to save roundtables, revisit boards, and review how decisions actually turned out.
      </p>

      <Button variant="outline" className="mt-6" onClick={google}>
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            className="mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            className="mt-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <button
        className="mt-5 text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
