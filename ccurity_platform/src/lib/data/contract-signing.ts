import { createClient } from "@/lib/supabase/server";

/* ── Types ─────────────────────────────────────── */

export type ContractToken = {
    id: string;
    contractId: string;
    token: string;
    role: "CLIENT" | "PROVIDER";
    userId: string;
    signedAt: string | null;
    createdAt: string;
    user?: { id: string; name: string; email: string };
    signature?: ContractSignature | null;
};

export type ContractSignature = {
    id: string;
    tokenId: string;
    selfieUrl: string | null;
    ineFrontUrl: string | null;
    ineBackUrl: string | null;
    signatureUrl: string | null;
    acceptedDigital: boolean;
    acceptedContent: boolean;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
};

export type ContractHistoryEntry = {
    id: string;
    contractId: string;
    tokenId: string | null;
    action: "VIEW" | "SIGN" | "COMMENT" | "MODIFY" | "SEND";
    ipAddress: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
    token?: { role: string; user?: { name: string } } | null;
};

/* ── Queries ───────────────────────────────────── */

/** Get contract + signer info by public token (for signing page) */
export async function getContractByToken(token: string) {
    const supabase = await createClient();

    // First get the token record
    const { data: tokenRecord, error: tokenErr } = await supabase
        .from("contract_tokens")
        .select(`*, user:users(id, name, email)`)
        .eq("token", token)
        .single();

    if (tokenErr || !tokenRecord) return null;

    // Then get the contract
    const { data: contract, error: contractErr } = await supabase
        .from("contracts")
        .select(
            `*, client:users!contracts_userId_fkey(id, name, email), contractType:contract_types(id, name, serviceType:service_types(id, name, color))`
        )
        .eq("id", tokenRecord.contractId)
        .single();

    if (contractErr || !contract) return null;

    // Get signature if it exists
    const { data: signature } = await supabase
        .from("contract_signatures")
        .select("*")
        .eq("tokenId", tokenRecord.id)
        .single();

    // Get both tokens for this contract (to check signing status)
    const { data: allTokens } = await supabase
        .from("contract_tokens")
        .select(`*, user:users(id, name, email), signature:contract_signatures(*)`)
        .eq("contractId", tokenRecord.contractId);

    return {
        contract,
        token: tokenRecord as ContractToken,
        signature: signature as ContractSignature | null,
        allTokens: (allTokens ?? []) as unknown as ContractToken[],
    };
}

/** Get all tokens for a contract (admin view) */
export async function getContractTokens(contractId: string): Promise<ContractToken[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("contract_tokens")
        .select(`*, user:users(id, name, email), signature:contract_signatures(*)`)
        .eq("contractId", contractId)
        .order("createdAt");

    if (error) throw error;
    return (data ?? []) as unknown as ContractToken[];
}

/** Get audit log for a contract */
export async function getContractHistory(contractId: string): Promise<ContractHistoryEntry[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("contract_history")
        .select(`*, token:contract_tokens(role, user:users(name))`)
        .eq("contractId", contractId)
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as ContractHistoryEntry[];
}

/** Log an action to the contract history */
export async function logContractAction(params: {
    contractId: string;
    tokenId?: string;
    action: "VIEW" | "SIGN" | "COMMENT" | "MODIFY" | "SEND";
    ipAddress?: string;
    metadata?: Record<string, unknown>;
}) {
    const supabase = await createClient();

    await supabase.from("contract_history").insert({
        contractId: params.contractId,
        tokenId: params.tokenId ?? null,
        action: params.action,
        ipAddress: params.ipAddress ?? null,
        metadata: params.metadata ?? {},
    });
}
