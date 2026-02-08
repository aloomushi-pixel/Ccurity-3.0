import { notFound } from "next/navigation";
import { getContractByToken } from "@/lib/data/contract-signing";
import { logViewAction } from "./actions";
import SigningWizard from "./signing-wizard";

export const dynamic = "force-dynamic";

export default async function ContractSigningPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const data = await getContractByToken(token);

    if (!data) return notFound();

    // Log the view action
    await logViewAction(token);

    const { contract, token: tokenRecord, signature, allTokens } = data;
    const alreadySigned = !!tokenRecord.signedAt;
    const bothSigned = allTokens.every((t) => t.signedAt != null);

    return (
        <div
            className="min-h-screen"
            style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)" }}
        >
            {/* Header with CCurity logo */}
            <header className="border-b border-white/10 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://ccurity.com.mx/wp-content/uploads/2023/07/CCURITY-PROVEEDOR-DE-SISTEMAS-DE-SEGURIDAD-1.svg"
                            alt="CCurity"
                            className="h-8"
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">
                            {tokenRecord.role === "CLIENT" ? "📋 Firmante: Cliente" : "📋 Firmante: Proveedor"}
                        </p>
                        <p className="text-xs text-gray-500">{tokenRecord.user?.name}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-6">
                {/* Contract info card */}
                <div
                    className="rounded-xl p-6 mb-6 border border-white/10"
                    style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}
                >
                    <h1 className="text-xl font-bold text-white mb-2">{contract.title}</h1>
                    {contract.contractType && (
                        <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                            style={{
                                backgroundColor: `${contract.contractType.serviceType?.color ?? "#6B7280"}20`,
                                color: contract.contractType.serviceType?.color ?? "#6B7280",
                            }}
                        >
                            {contract.contractType.name}
                        </span>
                    )}
                    {contract.description && (
                        <p className="text-sm text-gray-400 mt-2">{contract.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs">Inicio</p>
                            <p className="text-gray-300">
                                {contract.startDate
                                    ? new Date(contract.startDate).toLocaleDateString("es-MX")
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Fin</p>
                            <p className="text-gray-300">
                                {contract.endDate
                                    ? new Date(contract.endDate).toLocaleDateString("es-MX")
                                    : "—"}
                            </p>
                        </div>
                    </div>

                    {/* Signing status for both parties */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-500 mb-2">Estado de firmas</p>
                        <div className="flex gap-4">
                            {allTokens.map((t: any) => (
                                <div key={t.id} className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${t.signedAt ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
                                    <span className="text-xs text-gray-400">
                                        {t.role === "CLIENT" ? "Cliente" : "Proveedor"}: {t.signedAt ? "✅ Firmado" : "⏳ Pendiente"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Signing wizard or completion message */}
                {bothSigned ? (
                    <div className="rounded-xl p-8 border border-green-500/30 text-center" style={{ background: "rgba(34,197,94,0.05)" }}>
                        <p className="text-4xl mb-3">🎉</p>
                        <h2 className="text-lg font-bold text-green-400 mb-2">Contrato firmado por ambas partes</h2>
                        <p className="text-sm text-gray-400">Este contrato está completamente firmado y activo.</p>
                    </div>
                ) : alreadySigned ? (
                    <div className="rounded-xl p-8 border border-blue-500/30 text-center" style={{ background: "rgba(59,130,246,0.05)" }}>
                        <p className="text-4xl mb-3">✅</p>
                        <h2 className="text-lg font-bold text-blue-400 mb-2">Tu firma fue registrada</h2>
                        <p className="text-sm text-gray-400">Esperando la firma de la otra parte.</p>
                    </div>
                ) : (
                    <SigningWizard token={token} signerName={tokenRecord.user?.name ?? "Firmante"} />
                )}
            </main>

            <footer className="border-t border-white/10 px-6 py-4 mt-12">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs text-gray-600">
                        Este documento es propiedad de CCurity. Contrato generado el{" "}
                        {new Date(contract.createdAt).toLocaleDateString("es-MX", {
                            year: "numeric", month: "long", day: "numeric",
                        })}.
                    </p>
                </div>
            </footer>
        </div>
    );
}
