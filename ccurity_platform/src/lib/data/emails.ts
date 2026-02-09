import { createClient } from "@/lib/supabase/server";

export interface Email {
    id: string;
    resend_id: string | null;
    direction: "inbound" | "outbound";
    from_address: string;
    to_addresses: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    html_body: string | null;
    text_body: string | null;
    status: "draft" | "sent" | "delivered" | "bounced" | "received" | "failed";
    is_read: boolean;
    is_starred: boolean;
    folder: "inbox" | "sent" | "drafts" | "trash";
    sent_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface EmailStats {
    total: number;
    unread: number;
    inbox: number;
    sent: number;
    drafts: number;
    trash: number;
    starred: number;
}

// --- Lecturas ---

export async function getEmails(
    folder: string = "inbox",
    search?: string
): Promise<Email[]> {
    const supabase = await createClient();

    let query = supabase
        .from("emails")
        .select("*")
        .eq("folder", folder)
        .order("created_at", { ascending: false })
        .limit(50);

    if (search) {
        query = query.or(
            `subject.ilike.%${search}%,from_address.ilike.%${search}%,text_body.ilike.%${search}%`
        );
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
    return (data as Email[]) || [];
}

export async function getEmailById(id: string): Promise<Email | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching email:", error);
        return null;
    }
    return data as Email;
}

export async function getEmailStats(): Promise<EmailStats> {
    const supabase = await createClient();

    const [totalRes, unreadRes, inboxRes, sentRes, draftsRes, trashRes, starredRes] =
        await Promise.all([
            supabase.from("emails").select("id", { count: "exact", head: true }),
            supabase
                .from("emails")
                .select("id", { count: "exact", head: true })
                .eq("is_read", false)
                .neq("folder", "trash"),
            supabase
                .from("emails")
                .select("id", { count: "exact", head: true })
                .eq("folder", "inbox"),
            supabase
                .from("emails")
                .select("id", { count: "exact", head: true })
                .eq("folder", "sent"),
            supabase
                .from("emails")
                .select("id", { count: "exact", head: true })
                .eq("folder", "drafts"),
            supabase
                .from("emails")
                .select("id", { count: "exact", head: true })
                .eq("folder", "trash"),
            supabase
                .from("emails")
                .select("id", { count: "exact", head: true })
                .eq("is_starred", true),
        ]);

    return {
        total: totalRes.count ?? 0,
        unread: unreadRes.count ?? 0,
        inbox: inboxRes.count ?? 0,
        sent: sentRes.count ?? 0,
        drafts: draftsRes.count ?? 0,
        trash: trashRes.count ?? 0,
        starred: starredRes.count ?? 0,
    };
}

// --- Mutaciones ---

export async function markEmailAsRead(id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("emails")
        .update({ is_read: true })
        .eq("id", id);
    return !error;
}

export async function toggleEmailStar(id: string): Promise<boolean> {
    const supabase = await createClient();

    // Obtener estado actual
    const { data } = await supabase
        .from("emails")
        .select("is_starred")
        .eq("id", id)
        .single();

    if (!data) return false;

    const { error } = await supabase
        .from("emails")
        .update({ is_starred: !data.is_starred })
        .eq("id", id);
    return !error;
}

export async function moveEmailToTrash(id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("emails")
        .update({ folder: "trash" })
        .eq("id", id);
    return !error;
}

export async function deleteEmail(id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.from("emails").delete().eq("id", id);
    return !error;
}

export async function saveEmail(email: Partial<Email>): Promise<Email | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("emails")
        .insert(email)
        .select()
        .single();

    if (error) {
        console.error("Error saving email:", error);
        return null;
    }
    return data as Email;
}
