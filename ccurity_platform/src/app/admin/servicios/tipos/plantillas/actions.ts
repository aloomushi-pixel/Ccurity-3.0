"use server";

import { revalidatePath } from "next/cache";
import {
    addTemplateConcept,
    removeTemplateConcept,
    updateTemplateConceptQuantity,
} from "@/lib/data/service-type-concepts";

export async function addTemplateConceptAction(formData: FormData) {
    const serviceTypeId = formData.get("serviceTypeId") as string;
    const conceptId = formData.get("conceptId") as string;
    const defaultQuantity = Number(formData.get("defaultQuantity") || 1);

    if (!serviceTypeId || !conceptId) return;

    await addTemplateConcept(serviceTypeId, conceptId, defaultQuantity);
    revalidatePath(`/admin/servicios/tipos/plantillas`);
}

export async function updateTemplateQuantityAction(formData: FormData) {
    const id = formData.get("id") as string;
    const defaultQuantity = Number(formData.get("defaultQuantity"));

    if (!id || isNaN(defaultQuantity) || defaultQuantity < 1) return;

    await updateTemplateConceptQuantity(id, defaultQuantity);
    revalidatePath(`/admin/servicios/tipos/plantillas`);
}

export async function removeTemplateConceptAction(formData: FormData) {
    const id = formData.get("id") as string;
    if (!id) return;

    await removeTemplateConcept(id);
    revalidatePath(`/admin/servicios/tipos/plantillas`);
}
