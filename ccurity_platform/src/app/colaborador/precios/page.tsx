import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCollaboratorPrices } from "@/lib/data/collaborator-prices";
import { getConcepts } from "@/lib/data/concepts";
import { PreciosClient } from "./PreciosClient";

export default async function PreciosPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [prices, concepts] = await Promise.all([
        getCollaboratorPrices(user.id),
        getConcepts(),
    ]);

    // Only active concepts available for pricing
    const activeConcepts = concepts.filter((c) => c.isActive);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div>
                        <a
                            href="/colaborador"
                            className="text-xs text-muted hover:text-primary transition-colors"
                        >
                            ← Volver al Dashboard
                        </a>
                        <h1 className="text-xl font-bold mt-1">
                            💰 Mis Precios CPU
                        </h1>
                        <p className="text-sm text-muted mt-0.5">
                            Define precios personalizados para los conceptos del catálogo
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <PreciosClient
                    prices={prices}
                    concepts={activeConcepts.map((c) => ({
                        id: c.id,
                        title: c.title,
                        category: c.category || "",
                        format: c.format || "",
                        price: c.price,
                    }))}
                />
            </main>
        </div>
    );
}
