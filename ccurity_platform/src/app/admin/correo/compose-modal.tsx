"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Send, Loader2 } from "lucide-react";

interface ComposeModalProps {
    onClose: () => void;
    replyTo?: {
        to: string;
        subject: string;
    };
}

export function ComposeModal({ onClose, replyTo }: ComposeModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [to, setTo] = useState(replyTo?.to || "");
    const [cc, setCc] = useState("");
    const [subject, setSubject] = useState(
        replyTo ? `Re: ${replyTo.subject}` : ""
    );
    const [body, setBody] = useState("");
    const [showCc, setShowCc] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSend() {
        if (!to.trim() || !subject.trim()) {
            setError("Destinatario y asunto son requeridos");
            return;
        }

        setError("");

        startTransition(async () => {
            try {
                const res = await fetch("/api/email/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: to
                            .split(",")
                            .map((e) => e.trim())
                            .filter(Boolean),
                        cc: cc
                            ? cc
                                .split(",")
                                .map((e) => e.trim())
                                .filter(Boolean)
                            : undefined,
                        subject,
                        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">${body.replace(/\n/g, "<br/>")}</div>`,
                        text: body,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Error al enviar");
                    return;
                }

                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    router.refresh();
                }, 1500);
            } catch {
                setError("Error de conexión");
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 mb-4 sm:mb-0 glass-card shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                    <h2 className="font-semibold text-sm">
                        {replyTo ? "Responder" : "Nuevo Email"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-surface-2 text-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Campos */}
                <div className="px-5 py-3 space-y-2 border-b border-border flex-shrink-0">
                    {/* Para */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-muted w-10 flex-shrink-0">
                            Para:
                        </label>
                        <input
                            type="text"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="email@ejemplo.com (separar con comas)"
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted/50"
                        />
                        {!showCc && (
                            <button
                                type="button"
                                onClick={() => setShowCc(true)}
                                className="text-xs text-muted hover:text-primary transition-colors cursor-pointer"
                            >
                                CC
                            </button>
                        )}
                    </div>

                    {/* CC */}
                    {showCc && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted w-10 flex-shrink-0">
                                CC:
                            </label>
                            <input
                                type="text"
                                value={cc}
                                onChange={(e) => setCc(e.target.value)}
                                placeholder="email@ejemplo.com"
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted/50"
                            />
                        </div>
                    )}

                    {/* Asunto */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-muted w-10 flex-shrink-0">
                            Asunto:
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Asunto del email"
                            className="flex-1 bg-transparent text-sm outline-none font-medium placeholder:text-muted/50 placeholder:font-normal"
                        />
                    </div>
                </div>

                {/* Cuerpo */}
                <div className="flex-1 overflow-hidden">
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Escribe tu mensaje aquí..."
                        className="w-full h-full min-h-[250px] p-5 bg-transparent text-sm outline-none resize-none placeholder:text-muted/50"
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-border flex-shrink-0">
                    <div className="flex-1">
                        {error && (
                            <p className="text-xs text-red-400">{error}</p>
                        )}
                        {success && (
                            <p className="text-xs text-emerald-400 flex items-center gap-1">
                                ✓ Email enviado exitosamente
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                        >
                            Descartar
                        </button>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isPending || success}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
