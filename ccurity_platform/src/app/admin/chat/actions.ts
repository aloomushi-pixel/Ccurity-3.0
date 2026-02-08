"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createConversationAction(formData: FormData) {
    const supabase = await createClient();

    const title = (formData.get("title") as string) || null;
    const participantIds = (formData.get("participantIds") as string)
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    if (participantIds.length === 0) throw new Error("Se necesita al menos un participante");

    // Create conversation
    const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({ title })
        .select("id")
        .single();

    if (convErr || !conv) throw convErr || new Error("Error al crear conversación");

    // Add participants
    const participants = participantIds.map((userId) => ({
        conversationId: conv.id,
        userId,
    }));

    const { error: partErr } = await supabase
        .from("conversation_participants")
        .insert(participants);

    if (partErr) throw partErr;

    revalidatePath("/admin/chat");
}

export async function sendMessageAction(formData: FormData) {
    const supabase = await createClient();

    const conversationId = formData.get("conversationId") as string;
    const senderId = formData.get("senderId") as string;
    const content = formData.get("content") as string;

    if (!content.trim()) return;

    const { error } = await supabase.from("messages").insert({
        conversationId,
        senderId,
        content: content.trim(),
    });

    if (error) throw error;

    // Update conversation timestamp
    await supabase
        .from("conversations")
        .update({ updatedAt: new Date().toISOString() })
        .eq("id", conversationId);

    revalidatePath("/admin/chat");
}

export async function markAsReadAction(formData: FormData) {
    const supabase = await createClient();
    const conversationId = formData.get("conversationId") as string;

    const { error } = await supabase
        .from("messages")
        .update({ isRead: true })
        .eq("conversationId", conversationId)
        .eq("isRead", false);

    if (error) throw error;
    revalidatePath("/admin/chat");
}
