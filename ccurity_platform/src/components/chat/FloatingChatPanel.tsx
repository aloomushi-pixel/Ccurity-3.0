"use client";

import { useState, useRef, useEffect } from "react";
import { useRealtimeMessages, type RealtimeMessage } from "@/hooks/useRealtimeMessages";
import { sendMessageAction, markAsReadAction } from "@/app/admin/chat/actions";
import type { ConversationSummary } from "@/lib/data/conversations";

type Props = {
    conversations: ConversationSummary[];
    currentUserId: string;
    initialMessages: Record<string, RealtimeMessage[]>;
    participantNames: Record<string, Record<string, string>>;
};

export function FloatingChatPanel({
    conversations,
    currentUserId,
    initialMessages,
    participantNames,
}: Props) {
    const [selectedConv, setSelectedConv] = useState<string | null>(null);

    const selected = conversations.find((c) => c.id === selectedConv);

    return (
        <div className="fixed bottom-24 right-6 z-[998] w-[380px] h-[500px] bg-surface border border-border rounded-2xl shadow-2xl shadow-black/30 flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
            {selectedConv && selected ? (
                <ChatView
                    conversationId={selectedConv}
                    currentUserId={currentUserId}
                    initialMessages={initialMessages[selectedConv] ?? []}
                    participantNames={participantNames[selectedConv] ?? {}}
                    title={selected.title || selected.participants.map((p) => p.name).join(", ")}
                    onBack={() => setSelectedConv(null)}
                />
            ) : (
                <ConvoList
                    conversations={conversations}
                    onSelect={(id) => {
                        setSelectedConv(id);
                        // Mark as read
                        const fd = new FormData();
                        fd.set("conversationId", id);
                        markAsReadAction(fd);
                    }}
                />
            )}
        </div>
    );
}

/* ── Conversation list view inside the panel ─── */

function ConvoList({
    conversations,
    onSelect,
}: {
    conversations: ConversationSummary[];
    onSelect: (id: string) => void;
}) {
    return (
        <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-surface-2/50">
                <h3 className="text-sm font-semibold">💬 Conversaciones</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted text-sm">
                        Sin conversaciones
                    </div>
                )}
                {conversations.map((c) => {
                    const names = c.participants.map((p) => p.name).join(", ");
                    return (
                        <button
                            key={c.id}
                            onClick={() => onSelect(c.id)}
                            className="w-full text-left px-4 py-3 border-b border-border/50 hover:bg-surface-2/70 transition-colors cursor-pointer"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm truncate">
                                        {c.title || names || "Conversación"}
                                    </p>
                                    {c.lastMessage && (
                                        <p className="text-xs text-muted truncate mt-0.5">
                                            <span className="font-medium">
                                                {c.lastMessage.senderName}:
                                            </span>{" "}
                                            {c.lastMessage.content}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    {c.lastMessage && (
                                        <span className="text-[10px] text-muted">
                                            {new Date(
                                                c.lastMessage.createdAt
                                            ).toLocaleTimeString("es-MX", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    )}
                                    {c.unreadCount > 0 && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-[10px] text-white font-bold">
                                            {c.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </>
    );
}

/* ── Chat view inside the panel ──────────────── */

function ChatView({
    conversationId,
    currentUserId,
    initialMessages,
    participantNames,
    title,
    onBack,
}: {
    conversationId: string;
    currentUserId: string;
    initialMessages: RealtimeMessage[];
    participantNames: Record<string, string>;
    title: string;
    onBack: () => void;
}) {
    const { messages } = useRealtimeMessages(conversationId, initialMessages);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    return (
        <>
            {/* Header with back button */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2/50">
                <button
                    onClick={onBack}
                    className="text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                    ←
                </button>
                <h3 className="text-sm font-semibold truncate flex-1">{title}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted text-sm">
                        Sin mensajes aún
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    const senderName = participantNames[msg.senderId] || "Usuario";
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-3 py-2 ${isMe
                                        ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-md"
                                        : "bg-surface-2 border border-border rounded-bl-md"
                                    }`}
                            >
                                {!isMe && (
                                    <p className="text-[10px] font-medium text-primary-light mb-0.5">
                                        {senderName}
                                    </p>
                                )}
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <p
                                    className={`text-[9px] mt-0.5 ${isMe ? "text-white/60" : "text-muted"
                                        }`}
                                >
                                    {new Date(msg.createdAt).toLocaleTimeString("es-MX", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
                className="border-t border-border p-2 flex gap-2"
                action={async (formData) => {
                    const content = formData.get("content") as string;
                    if (!content.trim()) return;
                    const form = document.getElementById(
                        `floating-form-${conversationId}`
                    ) as HTMLFormElement;
                    form?.reset();
                    await sendMessageAction(formData);
                }}
                id={`floating-form-${conversationId}`}
            >
                <input type="hidden" name="conversationId" value={conversationId} />
                <input type="hidden" name="senderId" value={currentUserId} />
                <input
                    name="content"
                    placeholder="Mensaje…"
                    autoComplete="off"
                    className="flex-1 px-3 py-2 rounded-full bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                    →
                </button>
            </form>
        </>
    );
}
