"use client";

import { useRef, useEffect } from "react";
import { useRealtimeMessages, type RealtimeMessage } from "@/hooks/useRealtimeMessages";
import { sendMessageAction } from "./actions";

type Props = {
    conversationId: string;
    currentUserId: string;
    initialMessages: RealtimeMessage[];
    participantNames: Record<string, string>;
};

export function ChatWindow({
    conversationId,
    currentUserId,
    initialMessages,
    participantNames,
}: Props) {
    const { messages } = useRealtimeMessages(conversationId, initialMessages);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted text-sm">
                        Sin mensajes aún. ¡Envía el primero!
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
                                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe
                                        ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-md"
                                        : "bg-surface-2 border border-border rounded-bl-md"
                                    }`}
                            >
                                {!isMe && (
                                    <p className="text-xs font-medium text-primary-light mb-0.5">
                                        {senderName}
                                    </p>
                                )}
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <p
                                    className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted"
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

            {/* Input area */}
            <form
                className="border-t border-border p-3 flex gap-2"
                action={async (formData) => {
                    const content = formData.get("content") as string;
                    if (!content.trim()) return;

                    // Reset input
                    const form = document.getElementById(
                        `chat-form-${conversationId}`
                    ) as HTMLFormElement;
                    form?.reset();

                    await sendMessageAction(formData);
                }}
                id={`chat-form-${conversationId}`}
            >
                <input type="hidden" name="conversationId" value={conversationId} />
                <input type="hidden" name="senderId" value={currentUserId} />
                <input
                    name="content"
                    placeholder="Escribe un mensaje…"
                    autoComplete="off"
                    className="flex-1 px-4 py-2 rounded-full bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}
