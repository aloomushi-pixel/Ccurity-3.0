import { getConversations, getChatStats, getConversationMessages } from "@/lib/data/conversations";
import { ChatLayout } from "./chat-layout";
import { createConversationAction } from "./actions";
import Link from "next/link";
import type { Metadata } from "next";



export const metadata: Metadata = {
    title: "Chat — Ccurity Admin",
    description: "Comunicación interna del equipo y soporte al cliente.",
};

export default async function ChatPage() {
    const [conversations, stats] = await Promise.all([
        getConversations(),
        getChatStats(),
    ]);

    // Preload first conversation messages if any
    const firstConvId = conversations[0]?.id;
    const initialMessages = firstConvId
        ? await getConversationMessages(firstConvId)
        : [];

    // TODO: Replace with real auth user id
    const currentUserId = "system";

    return (
        <div className="flex flex-col h-[calc(100dvh-1px)]">
            {/* Header */}
            <div className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-muted hover:text-foreground transition-colors">
                        ← Regresar
                    </Link>
                    <h1 className="text-xl font-bold">💬 Centro de Mensajes</h1>
                </div>

                <div className="flex items-center gap-5">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted">
                            <span className="font-semibold text-foreground">{stats.totalConversations}</span>{" "}
                            conversaciones
                        </span>
                        <span className="text-muted">
                            <span className="font-semibold text-foreground">{stats.totalMessages}</span>{" "}
                            mensajes
                        </span>
                        {stats.unreadMessages > 0 && (
                            <span className="px-2.5 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                                {stats.unreadMessages} sin leer
                            </span>
                        )}
                    </div>

                    {/* New conversation form */}
                    <details className="relative">
                        <summary className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity list-none whitespace-nowrap">
                            + Nueva conversación
                        </summary>
                        <div className="absolute right-0 top-full mt-2 z-50 w-80 p-4 rounded-xl glass-card shadow-xl border border-border">
                            <form action={createConversationAction}>
                                <label className="block text-xs font-medium mb-1">Título (opcional)</label>
                                <input
                                    name="title"
                                    placeholder="Ej: Soporte para servicio #12"
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm mb-3"
                                />
                                <label className="block text-xs font-medium mb-1">
                                    IDs de participantes (separados por coma)
                                </label>
                                <input
                                    name="participantIds"
                                    required
                                    placeholder="uuid1, uuid2"
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm mb-3"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                                >
                                    Crear conversación
                                </button>
                            </form>
                        </div>
                    </details>
                </div>
            </div>

            {/* Chat area */}
            <ChatLayout
                conversations={conversations}
                currentUserId={currentUserId}
                initialConversationId={firstConvId}
                initialMessages={initialMessages}
            />
        </div>
    );
}
