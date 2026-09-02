import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment, FREE_ROUNDTABLES_PER_WEEK } from "@/lib/paddle";
import { getEntitlement, type Entitlement } from "@/lib/payments.functions";

const ANON_KEY = "borrowed-brain:free-usage";

type AnonUsage = { week: string; count: number };

function weekStart(): string {
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day))
    .toISOString()
    .slice(0, 10);
}

function readAnon(): AnonUsage {
  if (typeof window === "undefined") return { week: weekStart(), count: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ANON_KEY) ?? "null") as AnonUsage | null;
    if (parsed && parsed.week === weekStart()) return parsed;
  } catch {
    /* ignore */
  }
  return { week: weekStart(), count: 0 };
}

/** Anonymous (device-local) weekly counter — signed-in users are counted server-side. */
export function recordAnonymousRoundtable() {
  if (typeof window === "undefined") return;
  const cur = readAnon();
  window.localStorage.setItem(ANON_KEY, JSON.stringify({ week: cur.week, count: cur.count + 1 }));
}

export function anonymousRemaining(): number {
  return Math.max(0, FREE_ROUNDTABLES_PER_WEEK - readAnon().count);
}

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setEntitlement(null);
      setLoading(false);
      return;
    }
    try {
      const ent = await getEntitlement({ data: { environment: getPaddleEnvironment() } });
      setEntitlement(ent);
    } catch {
      setEntitlement(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    void refresh();
  }, [authLoading, refresh]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  const remaining = entitlement ? entitlement.remaining : anonymousRemaining();

  return {
    entitlement,
    isPro: entitlement?.pro ?? false,
    remaining,
    limit: FREE_ROUNDTABLES_PER_WEEK,
    loading: loading || authLoading,
    refresh,
  };
}
