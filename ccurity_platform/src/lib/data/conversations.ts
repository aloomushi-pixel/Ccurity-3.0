import { createClient } from "@/lib/supabase/server";

/* ── Types ─────────────────────────────────────── */

export type ConversationSummary = {
    id: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
    participants: { id: string; name: string; role: string }[];
    lastMessage: {
        content: string;
        createdAt: string;
        senderName: string;
    } | null;
    unreadCount: number;
};

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string | null;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender?: { id: string; name: string };
};

/* ── Queries ───────────────────────────────────── */

export async function getConversations(): Promise<ConversationSummary[]> {
    const supabase = await createClient();

    const { data: convos, error } = await supabase
        .from("conversations")
        .select(
            `id, title, createdAt, updatedAt,
             participants:conversation_participants(
                user:users!conversation_participants_userId_fkey(id, name, role)
             ),
             messages(id, content, createdAt, isRead, sender:users!messages_senderId_fkey(id, name))`
        )
        .order("updatedAt", { ascending: false });

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((convos ?? []) as unknown[]).map((c: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const participants = (c.participants ?? []).map((p: any) => ({
            id: p.user?.id ?? "",
            name: p.user?.name ?? "—",
            role: p.user?.role ?? "CLIENT",
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msgs = (c.messages ?? []) as any[];
        msgs.sort(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const last = msgs[0] ?? null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unreadCount = msgs.filter((m: any) => !m.isRead).length;

        return {
            id: c.id,
            title: c.title,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            participants,
            lastMessage: last
                ? {
                    content: last.content,
                    createdAt: last.createdAt,
                    senderName: last.sender?.name ?? "—",
                }
                : null,
            unreadCount,
        };
    });
}

export async function getConversationMessages(conversationId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("messages")
        .select(
            "id, conversationId, senderId, receiverId, content, isRead, createdAt, sender:users!messages_senderId_fkey(id, name)"
        )
        .eq("conversationId", conversationId)
        .order("createdAt", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as Message[];
}

export async function getConversationParticipants(conversationId: string) {
    const supabase = await createClient();

    const { data } = await supabase
        .from("conversation_participants")
        .select("user:users!conversation_participants_userId_fkey(id, name, role)")
        .eq("conversationId", conversationId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((p) => ({
        id: p.user?.id ?? "",
        name: p.user?.name ?? "—",
        role: p.user?.role ?? "CLIENT",
    }));
}

export async function getChatStats() {
    const supabase = await createClient();

    const { count: totalConvs } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true });

    const { count: totalMsgs } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true });

    const { count: unreadMsgs } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("isRead", false);

    return {
        totalConversations: totalConvs ?? 0,
        totalMessages: totalMsgs ?? 0,
        unreadMessages: unreadMsgs ?? 0,
    };
}
