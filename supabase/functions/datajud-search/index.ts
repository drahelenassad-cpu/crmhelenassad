import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("DATAJUD_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { numeroProcesso, tribunal } = await req.json();

    if (!numeroProcesso || typeof numeroProcesso !== "string") {
      return new Response(JSON.stringify({ error: "Número do processo é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean - only digits
    const cleanNumero = numeroProcesso.replace(/\D/g, "");
    if (cleanNumero.length < 5) {
      return new Response(JSON.stringify({ error: "Número do processo muito curto" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // List of tribunal endpoints to search
    const tribunais = tribunal
      ? [tribunal]
      : [
          "api_publica_trf1",
          "api_publica_trf2",
          "api_publica_trf3",
          "api_publica_trf4",
          "api_publica_trf5",
          "api_publica_tjsp",
          "api_publica_tjrj",
          "api_publica_tjmg",
          "api_publica_tjrs",
          "api_publica_tjpr",
          "api_publica_tjsc",
          "api_publica_tjba",
          "api_publica_tjpe",
          "api_publica_tjce",
          "api_publica_tjdft",
          "api_publica_stj",
        ];

    const allHits: any[] = [];

    for (const trib of tribunais) {
      try {
        const url = `https://api-publica.datajud.cnj.jus.br/${trib}/_search`;

        const body = {
          query: {
            match: {
              numeroProcesso: cleanNumero,
            },
          },
          size: 10,
          sort: [{ "@timestamp": "desc" }],
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `APIKey ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hits?.hits?.length > 0) {
            allHits.push(
              ...data.hits.hits.map((hit: any) => ({
                ...hit._source,
                _tribunal: trib,
              }))
            );
          }
        }
      } catch {
        // Skip tribunals that fail
      }

      // Stop early if we found results
      if (allHits.length > 0) break;
    }

    return new Response(JSON.stringify({ processos: allHits, total: allHits.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno ao buscar processos" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
