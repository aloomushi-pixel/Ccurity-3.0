
import { getServicesByStateName, calculateServiceCostForCollaborator } from "@/lib/data/services";
import { getApplicationsByService } from "@/lib/data/service-applications";
import { AdminPostulacionesClient } from "./AdminPostulacionesClient";

export default async function AdminPostulacionesPage() {
    const postulandoServices = await getServicesByStateName("Postulando");

    const servicesWithApplications = await Promise.all(
        postulandoServices.map(async (service) => {
            const applications = await getApplicationsByService(service.id);
            const pendingApps = applications.filter((a) => a.status === "pending");

            // Calcular costo estimado para cada postulante
            const appsWithCost = await Promise.all(
                pendingApps.map(async (a) => {
                    let estimatedCost = 0;
                    let costComplete = true;
                    try {
                        const cost = await calculateServiceCostForCollaborator(
                            service.id,
                            a.collaboratorId
                        );
                        estimatedCost = cost.total;
                        costComplete = cost.complete;
                    } catch {
                        costComplete = false;
                    }

                    return {
                        id: a.id,
                        collaboratorId: a.collaboratorId,
                        collaboratorName: a.collaboratorName || "—",
                        collaboratorEmail: a.collaboratorEmail || "",
                        message: a.message,
                        createdAt: a.createdAt,
                        estimatedCost,
                        costComplete,
                    };
                })
            );

            return {
                id: service.id,
                description: service.description || service.title || "",
                clientName: service.client?.name || "—",
                typeName: service.serviceType?.name || "—",
                typeColor: service.serviceType?.color || "#666",
                scheduledDate: service.scheduledDate,
                applications: appsWithCost,
            };
        })
    );

    return (
        <>
            <p className="text-muted mb-6">
                Revisa y asigna colaboradores a los servicios disponibles. El costo estimado se calcula
                con los precios personalizados de cada colaborador.
            </p>
            <AdminPostulacionesClient services={servicesWithApplications} />
        </>
    );
}

