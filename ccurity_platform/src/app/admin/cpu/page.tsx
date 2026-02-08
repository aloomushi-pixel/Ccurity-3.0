import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { getConcepts, getConceptStats, getCategories, getConceptQuotationCounts } from "@/lib/data/concepts";
import CpuCatalogClient from "./CpuCatalogClient";

export default async function CpuCatalogPage() {
    const [concepts, stats, categories, quotationCounts] = await Promise.all([
        getConcepts(),
        getConceptStats(),
        getCategories(),
        getConceptQuotationCounts(),
    ]);

    return (
        <div className="min-h-dvh bg-background">
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin"
                        className="text-muted hover:text-foreground transition-colors text-sm"
                    >
                        ← Admin
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold">
                        📋 <span className="gradient-text">Catálogo CPU</span>
                    </h1>
                </div>
                <UserNav />
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <CpuCatalogClient
                    concepts={concepts}
                    categories={categories}
                    quotationCounts={quotationCounts}
                    stats={stats}
                />
            </main>
        </div>
    );
}
