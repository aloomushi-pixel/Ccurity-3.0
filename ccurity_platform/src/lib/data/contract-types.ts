import { createClient } from "@/lib/supabase/server";

/* ── Types ─────────────────────────────────────── */

export type ContractType = {
    id: string;
    serviceTypeId: string;
    name: string;
    description: string | null;
    isActive: boolean;
    order: number;
    createdAt: string;
    serviceType?: { id: string; name: string; color: string };
};

/* ── Queries ───────────────────────────────────── */

export async function getContractTypes(): Promise<ContractType[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("contract_types")
        .select(`*, serviceType:service_types!contract_types_serviceTypeId_fkey(id, name, color)`)
        .order("order", { ascending: true })
        .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as ContractType[];
}

export async function getContractTypesByServiceType(serviceTypeId: string): Promise<ContractType[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("contract_types")
        .select(`*, serviceType:service_types!contract_types_serviceTypeId_fkey(id, name, color)`)
        .eq("serviceTypeId", serviceTypeId)
        .eq("isActive", true)
        .order("order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as ContractType[];
}
