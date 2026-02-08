import Link from "next/link";
import { getContractById } from "@/lib/data/contracts";
import {
    updateContractStatusAction,
    registerPaymentAction,
    createInvoiceAction,
} from "../actions";
import { notFound } from "next/navigation";
import { getContractTokens, getContractHistory } from "@/lib/data/contract-signing";
import type { ContractToken, ContractHistoryEntry } from "@/lib/data/contract-signing";

const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-500/20 text-gray-300",
    PENDING_SIGNATURE: "bg-yellow-500/20 text-yellow-400",
    ACTIVE: "bg-green-500/20 text-green-400",
    COMPLETED: "bg-blue-500/20 text-blue-400",
    CANCELLED: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
    DRAFT: "Borrador",
    PENDING_SIGNATURE: "Pendiente firma",
    ACTIVE: "Activo",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
};

const methodLabels: Record<string, string> = {
    transfer: "Transferencia",
    cash: "Efectivo",
    card: "Tarjeta",
    check: "Cheque",
};

export default async function ContractDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const contract = await getContractById(id);
    if (!contract) notFound();

    const [tokens, history] = await Promise.all([
        getContractTokens(id),
        getContractHistory(id),
    ]);

    const totalPaid = contract.payments.reduce(
        (s, p) => s + Number(p.amount),
        0
    );

    // Total from associated invoices
    const totalInvoiced = contract.invoices.reduce(
        (s, inv) => s + Number(inv.total),
        0
    );

    const balance = totalInvoiced - totalPaid;
    const progressPct =
        totalInvoiced > 0
            ? Math.min(100, Math.round((totalPaid / totalInvoiced) * 100))
            : 0;

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border px-6 py-4 flex items-center gap-4">
                <Link href="/admin/finanzas" className="text-muted hover:text-foreground transition-colors">
                    ← Contratos
                </Link>
                <h1 className="text-xl font-bold truncate">{contract.title}</h1>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${statusColors[contract.status]}`}>
                    {statusLabels[contract.status]}
                </span>
            </header>

            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Overview cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Client */}
                    <div className="glass-card p-5">
                        <p className="text-xs text-muted mb-2">Cliente</p>
                        {/* eslint-disable @typescript-eslint/no-explicit-any */}
                        <p className="font-medium">{(contract as any).client?.name ?? "—"}</p>
                        <p className="text-sm text-muted">{(contract as any).client?.email ?? ""}</p>
                        {/* eslint-enable @typescript-eslint/no-explicit-any */}
                    </div>

                    {/* Financial */}
                    <div className="glass-card p-5">
                        <p className="text-xs text-muted mb-2">Financiero</p>
                        <div className="flex justify-between">
                            <span className="text-sm">Facturado:</span>
                            <span className="font-mono font-bold">${totalInvoiced.toLocaleString("es-MX")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Pagado:</span>
                            <span className="font-mono text-green-400">${totalPaid.toLocaleString("es-MX")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Saldo:</span>
                            <span className="font-mono text-yellow-400">${balance.toLocaleString("es-MX")}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 h-2 rounded-full bg-surface-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted mt-1 text-right">{progressPct}% cobrado</p>
                    </div>

                    {/* Dates & Actions */}
                    <div className="glass-card p-5">
                        <p className="text-xs text-muted mb-2">Periodo</p>
                        <p className="text-sm">Inicio: {new Date(contract.startDate).toLocaleDateString("es-MX")}</p>
                        {contract.endDate && <p className="text-sm">Fin: {new Date(contract.endDate).toLocaleDateString("es-MX")}</p>}

                        <div className="flex gap-2 mt-3">
                            {contract.status === "DRAFT" && (
                                <form action={updateContractStatusAction}>
                                    <input type="hidden" name="id" value={contract.id} />
                                    <input type="hidden" name="status" value="PENDING_SIGNATURE" />
                                    <button className="px-3 py-1.5 text-xs rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors cursor-pointer">
                                        ✉️ Enviar a firma
                                    </button>
                                </form>
                            )}
                            {contract.status === "ACTIVE" && (
                                <form action={updateContractStatusAction}>
                                    <input type="hidden" name="id" value={contract.id} />
                                    <input type="hidden" name="status" value="COMPLETED" />
                                    <button className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors cursor-pointer">
                                        🏁 Completar
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {contract.description && (
                    <div className="glass-card p-5">
                        <p className="text-xs text-muted mb-2">Descripción</p>
                        <p className="text-sm whitespace-pre-wrap">{contract.description}</p>
                    </div>
                )}

                {/* Payments section */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-sm">💳 Pagos ({contract.payments.length})</h2>
                    </div>

                    {/* Register payment form — requires an invoice */}
                    {contract.invoices.length > 0 && (
                        <details>
                            <summary className="px-5 py-2 text-xs text-primary cursor-pointer hover:underline list-none">
                                + Registrar pago
                            </summary>
                            <form action={registerPaymentAction} className="px-5 pb-4 grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-border pt-3">
                                <input type="hidden" name="contractId" value={contract.id} />
                                <div>
                                    <label className="block text-xs mb-1">Factura</label>
                                    <select name="invoiceId" required className="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm">
                                        {contract.invoices.map((inv) => (
                                            <option key={inv.id} value={inv.id}>{inv.number} — ${Number(inv.total).toLocaleString("es-MX")}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs mb-1">Monto</label>
                                    <input name="amount" type="number" step="0.01" required className="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1">Método</label>
                                    <select name="method" className="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm">
                                        <option value="transfer">Transferencia</option>
                                        <option value="cash">Efectivo</option>
                                        <option value="card">Tarjeta</option>
                                        <option value="check">Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs mb-1">Referencia</label>
                                    <input name="reference" className="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm" />
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs cursor-pointer hover:bg-primary/90 transition-colors">
                                        Registrar
                                    </button>
                                </div>
                            </form>
                        </details>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-muted">
                                    <th className="px-4 py-2">Factura</th>
                                    <th className="px-4 py-2">Monto</th>
                                    <th className="px-4 py-2">Método</th>
                                    <th className="px-4 py-2">Referencia</th>
                                    <th className="px-4 py-2">Fecha de pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract.payments.length === 0 && (
                                    <tr><td colSpan={5} className="px-4 py-6 text-center text-muted text-xs">Sin pagos registrados</td></tr>
                                )}
                                {contract.payments.map((p) => (
                                    <tr key={p.id} className="border-b border-border/50">
                                        <td className="px-4 py-2 font-mono text-muted">{p.invoiceId?.slice(0, 8) ?? "—"}</td>
                                        <td className="px-4 py-2 font-mono">${Number(p.amount).toLocaleString("es-MX")}</td>
                                        <td className="px-4 py-2">{methodLabels[p.method] ?? p.method}</td>
                                        <td className="px-4 py-2 text-muted">{p.reference || "—"}</td>
                                        <td className="px-4 py-2 text-muted">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("es-MX") : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Invoices section */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-sm">🧾 Facturas ({contract.invoices.length})</h2>
                    </div>

                    <details>
                        <summary className="px-5 py-2 text-xs text-primary cursor-pointer hover:underline list-none">
                            + Generar factura
                        </summary>
                        <form action={createInvoiceAction} className="px-5 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-border pt-3">
                            <input type="hidden" name="userId" value={contract.userId} />
                            <input type="hidden" name="contractId" value={contract.id} />
                            <div>
                                <label className="block text-xs mb-1">Subtotal</label>
                                <input name="subtotal" type="number" step="0.01" required className="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs mb-1">IVA</label>
                                <input name="tax" type="number" step="0.01" defaultValue={0} className="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs mb-1">Fecha de vencimiento</label>
                                <input name="dueDate" type="date" required className="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm" />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs cursor-pointer hover:bg-primary/90 transition-colors">
                                    Generar
                                </button>
                            </div>
                        </form>
                    </details>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-muted">
                                    <th className="px-4 py-2">Folio</th>
                                    <th className="px-4 py-2">Subtotal</th>
                                    <th className="px-4 py-2">IVA</th>
                                    <th className="px-4 py-2">Total</th>
                                    <th className="px-4 py-2">Emitida</th>
                                    <th className="px-4 py-2">Vence</th>
                                    <th className="px-4 py-2">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract.invoices.length === 0 && (
                                    <tr><td colSpan={7} className="px-4 py-6 text-center text-muted text-xs">Sin facturas</td></tr>
                                )}
                                {contract.invoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-border/50">
                                        <td className="px-4 py-2 font-mono font-medium">{inv.number}</td>
                                        <td className="px-4 py-2 font-mono">${Number(inv.subtotal).toLocaleString("es-MX")}</td>
                                        <td className="px-4 py-2 font-mono">${Number(inv.tax).toLocaleString("es-MX")}</td>
                                        <td className="px-4 py-2 font-mono font-bold">${Number(inv.total).toLocaleString("es-MX")}</td>
                                        <td className="px-4 py-2 text-muted">{new Date(inv.createdAt).toLocaleDateString("es-MX")}</td>
                                        <td className="px-4 py-2 text-muted">{new Date(inv.dueDate).toLocaleDateString("es-MX")}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${inv.status === "paid" ? "bg-green-500/20 text-green-400" :
                                                inv.status === "sent" ? "bg-blue-500/20 text-blue-400" :
                                                    inv.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                                                        "bg-gray-500/20 text-gray-300"
                                                }`}>
                                                {inv.status === "draft" ? "Borrador" : inv.status === "sent" ? "Enviada" : inv.status === "paid" ? "Pagada" : "Cancelada"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Signing tokens section */}
                {tokens.length > 0 && (
                    <div className="glass-card overflow-hidden">
                        <div className="px-5 py-3 border-b border-border">
                            <h2 className="font-semibold text-sm">🔑 Tokens de firma</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            {tokens.map((t: ContractToken) => (
                                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-2/50 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2.5 h-2.5 rounded-full ${t.signedAt ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {t.role === "CLIENT" ? "👤 Cliente" : "🏢 Proveedor"}: {t.user?.name ?? "—"}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {t.signedAt
                                                    ? `✅ Firmado el ${new Date(t.signedAt).toLocaleString("es-MX")}`
                                                    : "⏳ Pendiente de firma"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted font-mono break-all">
                                            /contrato/{t.token.slice(0, 8)}...
                                        </p>
                                        <a
                                            href={`/contrato/${t.token}`}
                                            target="_blank"
                                            rel="noopener"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Abrir enlace →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Audit history */}
                {history.length > 0 && (
                    <div className="glass-card overflow-hidden">
                        <div className="px-5 py-3 border-b border-border">
                            <h2 className="font-semibold text-sm">📜 Historial ({history.length})</h2>
                        </div>
                        <div className="p-5 space-y-2">
                            {history.map((h: ContractHistoryEntry) => {
                                const actionIcons: Record<string, string> = { VIEW: "👁", SIGN: "✍️", COMMENT: "💬", MODIFY: "📝", SEND: "📨" };
                                const actionLabels: Record<string, string> = { VIEW: "Visualizó", SIGN: "Firmó", COMMENT: "Comentó", MODIFY: "Modificó", SEND: "Envió a firma" };
                                return (
                                    <div key={h.id} className="flex items-start gap-3 text-sm py-2 border-b border-border/30 last:border-0">
                                        <span className="text-base">{actionIcons[h.action] ?? "📌"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-medium">{actionLabels[h.action] ?? h.action}</span>
                                                {h.token?.user?.name && (
                                                    <span className="text-muted"> — {h.token.user.name} ({h.token.role === "CLIENT" ? "Cliente" : "Proveedor"})</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {new Date(h.createdAt).toLocaleString("es-MX")}
                                                {h.ipAddress && <span> · IP: {h.ipAddress}</span>}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
