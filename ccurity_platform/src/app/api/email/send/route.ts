import { NextRequest, NextResponse } from "next/server";
import { resend, DEFAULT_FROM } from "@/lib/resend";
import { saveEmail } from "@/lib/data/emails";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Verificar rol admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Solo administradores pueden enviar emails" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { to, cc, bcc, subject, html, text, from, replyTo } = body;

        if (!to || !subject) {
            return NextResponse.json(
                { error: "Destinatario y asunto son requeridos" },
                { status: 400 }
            );
        }

        // Normalizar destinatarios a arrays
        const toArray = Array.isArray(to) ? to : [to];
        const ccArray = cc ? (Array.isArray(cc) ? cc : [cc]) : undefined;
        const bccArray = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined;

        // Enviar via Resend
        const { data, error } = await resend.emails.send({
            from: from || DEFAULT_FROM,
            to: toArray,
            cc: ccArray,
            bcc: bccArray,
            subject,
            html: html || undefined,
            text: text || undefined,
            replyTo: replyTo || undefined,
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json(
                { error: `Error al enviar: ${error.message}` },
                { status: 500 }
            );
        }

        // Guardar en Supabase
        await saveEmail({
            resend_id: data?.id || null,
            direction: "outbound",
            from_address: from || DEFAULT_FROM,
            to_addresses: toArray,
            cc: ccArray || [],
            bcc: bccArray || [],
            subject,
            html_body: html || null,
            text_body: text || null,
            status: "sent",
            is_read: true,
            folder: "sent",
            sent_by: user.id,
        });

        return NextResponse.json({
            success: true,
            id: data?.id,
            message: "Email enviado exitosamente",
        });
    } catch (err) {
        console.error("Send email error:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
