import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usar service_role para webhooks (no hay usuario autenticado)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        // Resend envia diferentes tipos de eventos
        // Para emails entrantes, el type es "email.received"
        if (type === "email.received") {
            const { from, to, subject, html, text, created_at } = data;

            await supabaseAdmin.from("emails").insert({
                resend_id: data.email_id || null,
                direction: "inbound",
                from_address: from,
                to_addresses: Array.isArray(to) ? to : [to],
                subject: subject || "(Sin asunto)",
                html_body: html || null,
                text_body: text || null,
                status: "received",
                is_read: false,
                folder: "inbox",
                created_at: created_at || new Date().toISOString(),
            });

            return NextResponse.json({ received: true });
        }

        // Eventos de estado: delivered, bounced, complained, etc.
        if (type === "email.delivered" || type === "email.bounced" || type === "email.complained") {
            const statusMap: Record<string, string> = {
                "email.delivered": "delivered",
                "email.bounced": "bounced",
                "email.complained": "bounced",
            };

            if (data.email_id) {
                await supabaseAdmin
                    .from("emails")
                    .update({ status: statusMap[type] })
                    .eq("resend_id", data.email_id);
            }

            return NextResponse.json({ received: true });
        }

        // Evento no manejado
        return NextResponse.json({ received: true, handled: false });
    } catch (err) {
        console.error("Webhook error:", err);
        return NextResponse.json(
            { error: "Error procesando webhook" },
            { status: 500 }
        );
    }
}
