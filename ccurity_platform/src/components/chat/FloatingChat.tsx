import { createClient } from "@/lib/supabase/server";
import { getConversations, getConversationMessages, getConversationParticipants } from "@/lib/data/conversations";
import { FloatingChatProvider } from "./FloatingChatProvider";
import type { RealtimeMessage } from "@/hooks/useRealtimeMessages";

/**
 * Server component wrapper that fetches chat data and renders the FloatingChatProvider.
 * Drop this into any page layout to add the floating chat.
 */
export async function FloatingChat() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return null;

        const conversations = await getConversations();

        // Pre-fetch messages and participant names for each conversation
        const initialMessages: Record<string, RealtimeMessage[]> = {};
        const participantNames: Record<string, Record<string, string>> = {};

        await Promise.all(
            conversations.map(async (conv) => {
                const [msgs, participants] = await Promise.all([
                    getConversationMessages(conv.id),
                    getConversationParticipants(conv.id),
                ]);
                initialMessages[conv.id] = msgs.map((m) => ({
                    id: m.id,
                    conversationId: m.conversationId,
                    senderId: m.senderId,
                    content: m.content,
                    isRead: m.isRead,
                    createdAt: m.createdAt,
                }));
                // Build a {userId: name} map
                const nameMap: Record<string, string> = {};
                participants.forEach((p) => {
                    nameMap[p.id] = p.name;
                });
                participantNames[conv.id] = nameMap;
            })
        );

        return (
            <FloatingChatProvider
                conversations={conversations}
                currentUserId={user.id}
                initialMessages={initialMessages}
                participantNames={participantNames}
            />
        );
    } catch (err) {
        console.error("[FloatingChat] Error loading chat data:", err);
        return null;
    }
}
