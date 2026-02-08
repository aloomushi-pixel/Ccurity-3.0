"use client";

import { useState } from "react";
import type { ConversationSummary, Message } from "@/lib/data/conversations";
import { ConversationList } from "./conversation-list";
import { ChatWindow } from "./chat-window";
import type { RealtimeMessage } from "@/hooks/useRealtimeMessages";

type Props = {
    conversations: ConversationSummary[];
    currentUserId: string;
    initialConversationId?: string;
    initialMessages?: Message[];
};

export function ChatLayout({
    conversations,
    currentUserId,
    initialConversationId,
    initialMessages = [],
}: Props) {
    const [selectedId, setSelectedId] = useState<string | null>(
        initialConversationId ?? conversations[0]?.id ?? null
    );

    const selectedConv = conversations.find((c) => c.id === selectedId);

    // Build participant name map
    const participantNames: Record<string, string> = {};
    if (selectedConv) {
        for (const p of selectedConv.participants) {
            participantNames[p.id] = p.name;
        }
    }

    // Map initial messages for the selected conversation
    const mappedMessages: RealtimeMessage[] =
        selectedId === initialConversationId
            ? initialMessages.map((m) => ({
                id: m.id,
                conversationId: m.conversationId,
                senderId: m.senderId,
                content: m.content,
                isRead: m.isRead,
                createdAt: m.createdAt,
            }))
            : [];

    return (
        <div className="flex h-[calc(100dvh-73px)] overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-border flex-shrink-0 bg-surface/50">
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {selectedId && selectedConv ? (
                    <>
                        {/* Chat header */}
                        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                                {(selectedConv.title || selectedConv.participants[0]?.name || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-sm">
                                    {selectedConv.title ||
                                        selectedConv.participants.map((p) => p.name).join(", ")}
                                </p>
                                <p className="text-xs text-muted">
                                    {selectedConv.participants.length} participante
                                    {selectedConv.participants.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>

                        <ChatWindow
                            conversationId={selectedId}
                            currentUserId={currentUserId}
                            initialMessages={mappedMessages}
                            participantNames={participantNames}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted">
                        <div className="text-center">
                            <div className="text-5xl mb-3">💬</div>
                            <p className="text-lg mb-1">Selecciona una conversación</p>
                            <p className="text-sm">o crea una nueva para empezar a chatear</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
