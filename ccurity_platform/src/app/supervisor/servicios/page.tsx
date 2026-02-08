import { getServicesByStateName } from "@/lib/data/services";
import { getApplicationsByService } from "@/lib/data/service-applications";
import { SupervisorServiciosClient } from "./SupervisorServiciosClient";

export default async function SupervisorServiciosPage() {
    const postulandoServices = await getServicesByStateName("Postulando");

    // Get applications for each service
    const servicesWithApplications = await Promise.all(
        postulandoServices.map(async (service) => {
            const applications = await getApplicationsByService(service.id);
            return {
                id: service.id,
                description: service.description || service.title || "",
                clientName: service.client?.name || "—",
                typeName: service.serviceType?.name || "—",
                typeColor: service.serviceType?.color || "#666",
                scheduledDate: service.scheduledDate,
                applications: applications
                    .filter((a) => a.status === "pending")
                    .map((a) => ({
                        id: a.id,
                        collaboratorId: a.collaboratorId,
                        collaboratorName: a.collaboratorName || "—",
                        collaboratorEmail: a.collaboratorEmail || "",
                        message: a.message,
                        createdAt: a.createdAt,
                    })),
            };
        })
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <a
                        href="/supervisor"
                        className="text-xs text-muted hover:text-primary transition-colors"
                    >
                        ← Volver al Dashboard
                    </a>
                    <h1 className="text-xl font-bold mt-1">
                        📋 Gestión de Postulaciones
                    </h1>
                    <p className="text-sm text-muted mt-0.5">
                        Revisa y asigna colaboradores a los servicios disponibles
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <SupervisorServiciosClient services={servicesWithApplications} />
            </main>
        </div>
    );
}
