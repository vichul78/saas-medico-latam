import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Client with user's token to verify identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user session
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Token invalido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body
    const { informe_id, patient_phone, patient_name, report_summary } =
      await req.json();

    if (!informe_id || !patient_phone || !patient_name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Faltan campos requeridos: informe_id, patient_phone, patient_name",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service role client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's clinica_id
    const { data: usuario, error: userError } = await supabaseAdmin
      .from("usuarios")
      .select("clinica_id, rol")
      .eq("id", user.id)
      .single();

    if (userError || !usuario) {
      return new Response(
        JSON.stringify({ success: false, error: "Usuario no encontrado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["admin_clinica", "medico"].includes(usuario.rol)) {
      return new Response(
        JSON.stringify({ success: false, error: "No tiene permisos para compartir informes" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify informe belongs to user's clinic and is firmado
    const { data: informe, error: informeError } = await supabaseAdmin
      .from("informes")
      .select("id, clinica_id, estado")
      .eq("id", informe_id)
      .eq("clinica_id", usuario.clinica_id)
      .eq("estado", "firmado")
      .single();

    if (informeError || !informe) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Informe no encontrado, no pertenece a su clinica, o no esta firmado",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate token and expiry
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Insert share_token
    const { error: insertError } = await supabaseAdmin
      .from("share_tokens")
      .insert({
        clinica_id: usuario.clinica_id,
        informe_id: informe_id,
        token: token,
        expires_at: expiresAt,
        created_by: user.id,
        metadata: { patient_phone, patient_name },
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ success: false, error: "Error al crear token de acceso" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct public URL
    const siteUrl =
      Deno.env.get("SITE_URL") || Deno.env.get("VITE_PUBLIC_URL") || "https://app.medicolatam.com";
    const shareUrl = `${siteUrl}/resultado/${token}`;

    // Send WhatsApp via Twilio
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

    if (!twilioSid || !twilioToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Configuracion de Twilio incompleta en el servidor",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const messageBody = `Hola ${patient_name}, su resultado medico esta disponible.\n\n${report_summary ? `Resumen: ${report_summary}\n\n` : ""}Puede verlo en el siguiente enlace (valido por 24 horas):\n${shareUrl}`;

    const formData = new URLSearchParams();
    formData.append("From", twilioFrom);
    formData.append("To", `whatsapp:+${patient_phone.replace(/\D/g, "")}`);
    formData.append("Body", messageBody);

    const twilioAuth = btoa(`${twilioSid}:${twilioToken}`);
    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error de Twilio: ${twilioData.message || "Error desconocido"}`,
          share_url: shareUrl,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        share_url: shareUrl,
        message_sid: twilioData.sid,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Error interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
