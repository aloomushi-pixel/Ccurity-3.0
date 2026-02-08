"use client";

import type { ConversationSummary } from "@/lib/data/conversations";

type Props = {
    conversations: ConversationSummary[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

export function ConversationList({ conversations, selectedId, onSelect }: Props) {
    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">💬 Conversaciones</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && (
                    <div className="p-6 text-center text-muted text-sm">
                        Sin conversaciones
                    </div>
                )}
                {conversations.map((c) => {
                    const isActive = c.id === selectedId;
                    const participantNames = c.participants
                        .map((p) => p.name)
                        .join(", ");
                    return (
                        <button
                            key={c.id}
                            onClick={() => onSelect(c.id)}
                            className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-surface-2/70 transition-colors cursor-pointer ${isActive ? "bg-surface-2 border-l-2 border-l-primary" : ""
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm truncate">
                                        {c.title || participantNames || "Conversación"}
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
                                            {new Date(c.lastMessage.createdAt).toLocaleTimeString(
                                                "es-MX",
                                                { hour: "2-digit", minute: "2-digit" }
                                            )}
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
        </div>
    );
}
