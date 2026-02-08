"use client";

import { useState } from "react";
import { FloatingChatButton } from "./FloatingChatButton";
import { FloatingChatPanel } from "./FloatingChatPanel";
import type { ConversationSummary } from "@/lib/data/conversations";
import type { RealtimeMessage } from "@/hooks/useRealtimeMessages";

type Props = {
    conversations: ConversationSummary[];
    currentUserId: string;
    initialMessages: Record<string, RealtimeMessage[]>;
    participantNames: Record<string, Record<string, string>>;
};

export function FloatingChatProvider({
    conversations,
    currentUserId,
    initialMessages,
    participantNames,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const totalUnread = conversations.reduce(
        (sum, c) => sum + c.unreadCount,
        0
    );

    return (
        <>
            {isOpen && (
                <FloatingChatPanel
                    conversations={conversations}
                    currentUserId={currentUserId}
                    initialMessages={initialMessages}
                    participantNames={participantNames}
                />
            )}
            <FloatingChatButton
                unreadCount={totalUnread}
                onClick={() => setIsOpen((prev) => !prev)}
                isOpen={isOpen}
            />
        </>
    );
}
