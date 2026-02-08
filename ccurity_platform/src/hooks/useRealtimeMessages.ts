"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type RealtimeMessage = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
};

export function useRealtimeMessages(
    conversationId: string | null,
    initialMessages: RealtimeMessage[] = []
) {
    const [messages, setMessages] = useState<RealtimeMessage[]>(initialMessages);

    // Reset when conversation changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(initialMessages);
    }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!conversationId) return;

        const supabase = createClient();

        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversationId=eq.${conversationId}`,
                },
                (payload) => {
                    const msg = payload.new as RealtimeMessage;
                    setMessages((prev) => {
                        // Deduplicate
                        if (prev.find((m) => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    const addOptimistic = useCallback((msg: RealtimeMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    return { messages, addOptimistic };
}
