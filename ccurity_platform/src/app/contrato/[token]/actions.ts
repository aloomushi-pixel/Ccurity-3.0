"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function submitSignatureAction(formData: FormData) {
    const supabase = await createClient();
    const headersList = await headers();

    const token = formData.get("token") as string;
    const selfieData = formData.get("selfie") as string; // base64
    const ineFrontData = formData.get("ineFront") as string; // base64
    const ineBackData = formData.get("ineBack") as string; // base64
    const signatureData = formData.get("signature") as string; // base64
    const acceptedDigital = formData.get("acceptedDigital") === "true";
    const acceptedContent = formData.get("acceptedContent") === "true";

    if (!acceptedDigital || !acceptedContent) {
        throw new Error("Both acceptance checkboxes are required");
    }

    // Find the token record
    const { data: tokenRecord, error: tokenErr } = await supabase
        .from("contract_tokens")
        .select("id, contractId, signedAt")
        .eq("token", token)
        .single();

    if (tokenErr || !tokenRecord) throw new Error("Invalid token");
    if (tokenRecord.signedAt) throw new Error("Already signed");

    const contractId = tokenRecord.contractId;
    const tokenId = tokenRecord.id;
    const timestamp = Date.now();

    // Upload photos to storage
    const uploads = await Promise.all([
        uploadBase64(supabase, `${contractId}/${tokenId}/selfie_${timestamp}.jpg`, selfieData),
        uploadBase64(supabase, `${contractId}/${tokenId}/ine_front_${timestamp}.jpg`, ineFrontData),
        uploadBase64(supabase, `${contractId}/${tokenId}/ine_back_${timestamp}.jpg`, ineBackData),
        uploadBase64(supabase, `${contractId}/${tokenId}/signature_${timestamp}.png`, signatureData),
    ]);

    const [selfieUrl, ineFrontUrl, ineBackUrl, signatureUrl] = uploads;

    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Create signature record
    const { error: sigErr } = await supabase.from("contract_signatures").insert({
        tokenId,
        selfieUrl,
        ineFrontUrl,
        ineBackUrl,
        signatureUrl,
        acceptedDigital,
        acceptedContent,
        ipAddress,
        userAgent,
    });

    if (sigErr) throw sigErr;

    // Mark token as signed
    await supabase
        .from("contract_tokens")
        .update({ signedAt: new Date().toISOString() })
        .eq("id", tokenId);

    // Log the SIGN action
    await supabase.from("contract_history").insert({
        contractId,
        tokenId,
        action: "SIGN",
        ipAddress,
        metadata: { userAgent },
    });

    // Check if both parties have signed
    const { data: allTokens } = await supabase
        .from("contract_tokens")
        .select("signedAt")
        .eq("contractId", contractId);

    const allSigned = allTokens?.every((t) => t.signedAt != null) ?? false;

    if (allSigned) {
        // Both signed — activate the contract
        await supabase
            .from("contracts")
            .update({ status: "ACTIVE", updatedAt: new Date().toISOString() })
            .eq("id", contractId);
    }

    revalidatePath(`/contrato/${token}`);
    revalidatePath(`/admin/finanzas/${contractId}`);
}

export async function logViewAction(token: string) {
    const supabase = await createClient();
    const headersList = await headers();

    const { data: tokenRecord } = await supabase
        .from("contract_tokens")
        .select("id, contractId")
        .eq("token", token)
        .single();

    if (!tokenRecord) return;

    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";

    await supabase.from("contract_history").insert({
        contractId: tokenRecord.contractId,
        tokenId: tokenRecord.id,
        action: "VIEW",
        ipAddress,
        metadata: { userAgent: headersList.get("user-agent") || "unknown" },
    });
}

/* ── Helpers ───────────────────────────────────── */

async function uploadBase64(
    supabase: Awaited<ReturnType<typeof createClient>>,
    path: string,
    base64Data: string
): Promise<string> {
    // base64Data format: "data:image/jpeg;base64,/9j/..."
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 data");

    const contentType = matches[1];
    const raw = matches[2];
    const buffer = Buffer.from(raw, "base64");

    const { error } = await supabase.storage
        .from("contract-files")
        .upload(path, buffer, { contentType, upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from("contract-files").getPublicUrl(path);
    return urlData.publicUrl;
}
