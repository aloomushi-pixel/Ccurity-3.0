import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { getServicesByStateName } from "@/lib/data/services";
import { getApplicationsByService } from "@/lib/data/service-applications";
import { AdminPostulacionesClient } from "./AdminPostulacionesClient";

export default async function AdminPostulacionesPage() {
    const postulandoServices = await getServicesByStateName("Postulando");

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
        <div className="min-h-dvh bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin"
                        className="text-muted hover:text-foreground transition-colors text-sm"
                    >
                        ← Panel Admin
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold">
                        📋 <span className="gradient-text">Gestión de Postulaciones</span>
                    </h1>
                </div>
                <UserNav />
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <p className="text-muted mb-6">
                    Revisa y asigna colaboradores a los servicios disponibles.
                </p>
                <AdminPostulacionesClient services={servicesWithApplications} />
            </main>
        </div>
    );
}
