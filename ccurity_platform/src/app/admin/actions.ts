"use server";

import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/data/profiles";

export async function updateUserAction(formData: FormData) {
    const id = formData.get("id") as string;
    const full_name = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;
    const company = formData.get("company") as string;
    const role = formData.get("role") as "ADMIN" | "SUPER" | "COLAB" | "CLIENT";
    const is_active = formData.get("is_active") === "true";

    await updateProfile(id, { full_name, phone, company, role, is_active });
    revalidatePath("/admin");
}

export async function toggleUserActiveAction(formData: FormData) {
    const id = formData.get("id") as string;
    const is_active = formData.get("is_active") === "true";

    await updateProfile(id, { is_active: !is_active });
    revalidatePath("/admin");
}
