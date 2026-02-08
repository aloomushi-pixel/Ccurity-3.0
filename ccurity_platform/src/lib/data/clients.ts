import { createClient } from "@/lib/supabase/server";

export type Client = {
    id: string;
    name: string;
    email: string;
};

export async function getClients(): Promise<Client[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .order("name", { ascending: true });

    if (error) return [];
    return (data as Client[]) || [];
}
