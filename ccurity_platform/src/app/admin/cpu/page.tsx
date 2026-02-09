
import { getConcepts, getConceptStats, getCategories, getConceptQuotationCounts } from "@/lib/data/concepts";
import CpuCatalogClient from "./CpuCatalogClient";
import type { Metadata } from "next";



export const metadata: Metadata = {
    title: "Catálogo CPU — Ccurity Admin",
    description: "Catálogo de productos y unidades del sistema.",
};

export default async function CpuCatalogPage() {
    const [concepts, stats, categories, quotationCounts] = await Promise.all([
        getConcepts(),
        getConceptStats(),
        getCategories(),
        getConceptQuotationCounts(),
    ]);

    return (
        <>
            <CpuCatalogClient
                concepts={concepts}
                categories={categories}
                quotationCounts={quotationCounts}
                stats={stats}
            />
        </>
    );
}
