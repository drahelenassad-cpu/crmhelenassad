import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to realtime changes on a table and call `onUpdate` whenever
 * an INSERT, UPDATE or DELETE happens.
 */
export function useRealtimeTable(table: string, onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onUpdate]);
}
