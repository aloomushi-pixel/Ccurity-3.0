import { getConversations, getConversationMessages } from "@/lib/data/conversations";
import Link from "next/link";

export default async function SupervisorChatPage() {
    const conversations = await getConversations();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border px-6 py-4 flex items-center gap-4">
                <Link href="/admin" className="text-muted hover:text-foreground transition-colors">
                    ← Regresar
                </Link>
                <h1 className="text-xl font-bold">🔍 Panel de Supervisión · Chat</h1>
                <span className="ml-auto text-sm text-muted">
                    Solo lectura · {conversations.length} conversaciones
                </span>
            </header>

            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {conversations.length === 0 && (
                    <div className="glass-card p-12 text-center text-muted">
                        <p className="text-4xl mb-2">💬</p>
                        <p>No hay conversaciones activas</p>
                    </div>
                )}

                {conversations.map((conv) => {
                    const participantNames = conv.participants.map((p) => p.name).join(", ");
                    return (
                        <div key={conv.id} className="glass-card overflow-hidden">
                            {/* Conversation header */}
                            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-white text-xs font-bold">
                                        {(conv.title || participantNames).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {conv.title || participantNames}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {conv.participants.length} participantes ·{" "}
                                            {conv.participants.map((p) => `${p.name} (${p.role})`).join(", ")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {conv.unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs font-bold rounded-full">
                                            {conv.unreadCount} sin leer
                                        </span>
                                    )}
                                    <span className="text-xs text-muted">
                                        Creada: {new Date(conv.createdAt).toLocaleDateString("es-MX")}
                                    </span>
                                </div>
                            </div>

                            {/* Last message preview */}
                            <div className="px-5 py-4">
                                {conv.lastMessage ? (
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-medium text-primary shrink-0">
                                            {conv.lastMessage.senderName}:
                                        </span>
                                        <p className="text-sm text-muted">
                                            {conv.lastMessage.content}
                                        </p>
                                        <span className="text-[10px] text-muted ml-auto shrink-0">
                                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString("es-MX", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted">Sin mensajes</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
