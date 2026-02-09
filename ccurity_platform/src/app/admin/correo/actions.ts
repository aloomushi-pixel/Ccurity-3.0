"use server";

import { revalidatePath } from "next/cache";
import {
    markEmailAsRead,
    toggleEmailStar,
    moveEmailToTrash,
    deleteEmail,
} from "@/lib/data/emails";

export async function markAsReadAction(id: string) {
    await markEmailAsRead(id);
    revalidatePath("/admin/correo");
}

export async function toggleStarAction(id: string) {
    await toggleEmailStar(id);
    revalidatePath("/admin/correo");
}

export async function moveToTrashAction(id: string) {
    await moveEmailToTrash(id);
    revalidatePath("/admin/correo");
}

export async function deleteEmailAction(id: string) {
    await deleteEmail(id);
    revalidatePath("/admin/correo");
}
