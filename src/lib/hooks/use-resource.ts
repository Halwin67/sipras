"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserClientOrNull } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import type { ResourceMap } from "@/lib/types";

type TableName = keyof ResourceMap;
type Row<T extends TableName> = ResourceMap[T];

function storageKey(table: string) { return `sipras_demo_data_${table}`; }

export function useResource<T extends TableName>(table: T, seed: Row<T>[]) {
  const { profile } = useAuth();
  const [items, setItems] = useState<Row<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = getBrowserClientOrNull();
    if (!supabase) {
      try {
        const stored = localStorage.getItem(storageKey(table));
        setItems(stored ? JSON.parse(stored) as Row<T>[] : seed);
      } catch {
        setItems(seed);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: queryError } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (queryError) { setError(queryError.message); setItems([]); }
    else { setError(null); setItems((data ?? []) as Row<T>[]); }
    setLoading(false);
  }, [table, seed]);

  useEffect(() => { void refresh(); }, [refresh]);

  const create = useCallback(async (payload: Partial<Row<T>>) => {
    const supabase = getBrowserClientOrNull();
    if (supabase) {
      const row = { ...payload, school_id: profile?.school_id, created_by: profile?.id };
      const { data, error: insertError } = await supabase.from(table).insert(row as never).select("*").single();
      if (insertError) throw new Error(insertError.message);
      setItems((current) => [data as Row<T>, ...current]);
      return data as Row<T>;
    }
    const row = { ...payload, id: crypto.randomUUID(), school_id: profile?.school_id, created_by: profile?.id } as Row<T>;
    setItems((current) => {
      const next = [row, ...current];
      localStorage.setItem(storageKey(table), JSON.stringify(next));
      return next;
    });
    return row;
  }, [profile, table]);

  const update = useCallback(async (id: string, patch: Partial<Row<T>>) => {
    const supabase = getBrowserClientOrNull();
    if (supabase) {
      const { data, error: updateError } = await supabase.from(table).update(patch as never).eq("id", id).select("*").single();
      if (updateError) throw new Error(updateError.message);
      setItems((current) => current.map((item) => item.id === id ? data as Row<T> : item));
      return;
    }
    setItems((current) => {
      const next = current.map((item) => item.id === id ? { ...item, ...patch } as Row<T> : item);
      localStorage.setItem(storageKey(table), JSON.stringify(next));
      return next;
    });
  }, [table]);

  const remove = useCallback(async (id: string) => {
    const supabase = getBrowserClientOrNull();
    if (supabase) {
      const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
      if (deleteError) throw new Error(deleteError.message);
    }
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      if (!supabase) localStorage.setItem(storageKey(table), JSON.stringify(next));
      return next;
    });
  }, [table]);

  return { items, loading, error, create, update, remove, refresh };
}
