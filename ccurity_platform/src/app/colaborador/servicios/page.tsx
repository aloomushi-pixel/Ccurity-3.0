import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getServicesByStateName } from "@/lib/data/services";
import { getApplicationsByCollaborator } from "@/lib/data/service-applications";
import { ServiciosClient } from "./ServiciosClient";

export default async function ColaboradorServiciosPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [availableServices, myApplications] = await Promise.all([
        getServicesByStateName("Postulando"),
        getApplicationsByCollaborator(user.id),
    ]);

    // Filter out services the collaborator already applied to
    const appliedServiceIds = new Set(myApplications.map((a) => a.serviceId));

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <a
                        href="/colaborador"
                        className="text-xs text-muted hover:text-primary transition-colors"
                    >
                        ← Volver al Dashboard
                    </a>
                    <h1 className="text-xl font-bold mt-1">🔧 Servicios Disponibles</h1>
                    <p className="text-sm text-muted mt-0.5">
                        Postúlate a los servicios disponibles o revisa tus postulaciones
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <ServiciosClient
                    availableServices={availableServices.map((s) => ({
                        id: s.id,
                        description: s.description || s.title || "",
                        scheduledDate: s.scheduledDate,
                        address: s.address,
                        clientName: s.client?.name || "—",
                        typeName: s.serviceType?.name || "—",
                        typeColor: s.serviceType?.color || "#666",
                        alreadyApplied: appliedServiceIds.has(s.id),
                    }))}
                    myApplications={myApplications.map((a) => ({
                        id: a.id,
                        serviceId: a.serviceId,
                        status: a.status,
                        serviceDescription: a.serviceDescription || "",
                        createdAt: a.createdAt,
                    }))}
                />
            </main>
        </div>
    );
}
