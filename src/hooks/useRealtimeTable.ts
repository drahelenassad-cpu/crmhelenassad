import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to realtime changes on a table and call `onUpdate` whenever
 * an INSERT, UPDATE or DELETE happens.
 */
export function useRealtimeTable(table: string, onUpdate: () => void) {
  const cb = useRef(onUpdate);
  cb.current = onUpdate;

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => cb.current())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);
}
