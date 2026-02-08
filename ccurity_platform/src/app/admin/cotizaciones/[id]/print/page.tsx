import { getQuotationById } from "@/lib/data/quotations";
import { notFound } from "next/navigation";
import { PrintButton } from "./print-button";

export default async function QuotationPrintPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const quotation = await getQuotationById(id);

    if (!quotation) notFound();

    const items = quotation.quotation_items || [];
    const fecha = new Date(quotation.createdAt).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    const vigencia = quotation.validUntil
        ? new Date(quotation.validUntil).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
        : "—";

    return (
        <html lang="es">
            <head>
                <title>Cotización — {quotation.title} | Ccurity</title>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
              @page { margin: 1.5cm; size: letter; }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .no-print { display: none !important; }
              }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a2e; font-size: 11pt; line-height: 1.5; background: #fff; }
              .page { max-width: 800px; margin: 0 auto; padding: 40px; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #6c63ff; }
              .brand h1 { font-size: 22pt; font-weight: 800; color: #6c63ff; }
              .brand p { color: #666; font-size: 9pt; margin-top: 4px; }
              .folio-box { text-align: right; }
              .folio-box .label { font-size: 8pt; color: #999; text-transform: uppercase; letter-spacing: 1px; }
              .folio-box .value { font-size: 13pt; font-weight: 700; color: #1a1a2e; }
              .folio-box .version { font-size: 9pt; color: #6c63ff; margin-top: 2px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
              .info-card { padding: 14px 16px; border-radius: 8px; background: #f8f8ff; border: 1px solid #e8e6ff; }
              .info-card .label { font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; color: #6c63ff; font-weight: 600; margin-bottom: 6px; }
              .info-card .name { font-size: 12pt; font-weight: 600; }
              .info-card .detail { font-size: 9pt; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
              thead th { background: #6c63ff; color: #fff; padding: 10px 12px; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
              thead th:first-child { border-radius: 6px 0 0 0; }
              thead th:last-child { border-radius: 0 6px 0 0; }
              tbody td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 10pt; }
              tbody tr:nth-child(even) { background: #fafafe; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .mono { font-family: 'Cascadia Code', 'Consolas', monospace; }
              .totals { display: flex; justify-content: flex-end; margin-bottom: 28px; }
              .totals-box { width: 260px; }
              .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 10pt; }
              .totals-row.grand { border-top: 2px solid #6c63ff; padding-top: 10px; margin-top: 4px; font-size: 14pt; font-weight: 700; color: #6c63ff; }
              .notes { padding: 14px 16px; border-radius: 8px; background: #fffef5; border: 1px solid #f0ead6; margin-bottom: 28px; }
              .notes .label { font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; color: #b8860b; font-weight: 600; margin-bottom: 6px; }
              .notes p { font-size: 10pt; color: #555; }
              .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 8pt; }
              .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
              .status-DRAFT { background: #f0f0f0; color: #888; }
              .status-SENT { background: #e6f4ff; color: #0070c0; }
              .status-ACCEPTED { background: #e6fff0; color: #008040; }
              .status-REJECTED { background: #ffe6e6; color: #c00; }
              .status-EXPIRED { background: #fff4e6; color: #b86c00; }
              .print-btn { position: fixed; bottom: 24px; right: 24px; padding: 12px 24px; background: #6c63ff; color: #fff; border: none; border-radius: 8px; font-size: 11pt; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(108,99,255,0.3); }
              .print-btn:hover { background: #5a52e0; }
            `,
                    }}
                />
            </head>
            <body>
                <div className="page">
                    {/* Header */}
                    <div className="header">
                        <div className="brand">
                            <h1>CCURITY</h1>
                            <p>Seguridad Electrónica Integral</p>
                        </div>
                        <div className="folio-box">
                            <div className="label">Cotización</div>
                            <div className="value">
                                {quotation.folio || `COT-${quotation.id.slice(0, 8).toUpperCase()}`}
                            </div>
                            <div className="version">
                                Versión {quotation.version}
                            </div>
                            <div style={{ marginTop: 6 }}>
                                <span className={`status-badge status-${quotation.status}`}>
                                    {quotation.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="label">Cliente</div>
                            <div className="name">
                                {quotation.client?.name || "Sin asignar"}
                            </div>
                            <div className="detail">
                                {quotation.client?.email}
                            </div>
                            {quotation.client?.phone && (
                                <div className="detail">
                                    Tel: {quotation.client.phone}
                                </div>
                            )}
                        </div>
                        <div className="info-card">
                            <div className="label">Detalles</div>
                            <div className="detail">
                                <strong>Fecha:</strong> {fecha}
                            </div>
                            <div className="detail">
                                <strong>Vigencia:</strong> {vigencia}
                            </div>
                            <div className="detail">
                                <strong>Título:</strong> {quotation.title}
                            </div>
                        </div>
                    </div>

                    {/* Items table */}
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "5%" }}>#</th>
                                <th style={{ width: "40%" }}>Concepto</th>
                                <th style={{ width: "12%" }}>Categoría</th>
                                <th className="text-center" style={{ width: "8%" }}>
                                    Cant.
                                </th>
                                <th className="text-center" style={{ width: "10%" }}>
                                    Unidad
                                </th>
                                <th className="text-right" style={{ width: "12%" }}>
                                    P. Unit.
                                </th>
                                <th className="text-right" style={{ width: "13%" }}>
                                    Importe
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item.id}>
                                    <td className="text-center">{idx + 1}</td>
                                    <td>
                                        {item.concept?.title || "—"}
                                    </td>
                                    <td style={{ fontSize: "9pt", color: "#888" }}>
                                        {item.concept?.category || "—"}
                                    </td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-center" style={{ fontSize: "9pt" }}>
                                        {item.concept?.format || "PZA"}
                                    </td>
                                    <td className="text-right mono">
                                        $
                                        {Number(item.unitPrice).toLocaleString(
                                            "es-MX",
                                            { minimumFractionDigits: 2 }
                                        )}
                                    </td>
                                    <td className="text-right mono" style={{ fontWeight: 600 }}>
                                        $
                                        {Number(item.total).toLocaleString(
                                            "es-MX",
                                            { minimumFractionDigits: 2 }
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="totals">
                        <div className="totals-box">
                            <div className="totals-row">
                                <span>Subtotal</span>
                                <span className="mono">
                                    $
                                    {Number(quotation.subtotal).toLocaleString(
                                        "es-MX",
                                        { minimumFractionDigits: 2 }
                                    )}
                                </span>
                            </div>
                            <div className="totals-row">
                                <span>IVA (16%)</span>
                                <span className="mono">
                                    $
                                    {Number(quotation.tax).toLocaleString(
                                        "es-MX",
                                        { minimumFractionDigits: 2 }
                                    )}
                                </span>
                            </div>
                            <div className="totals-row grand">
                                <span>Total</span>
                                <span className="mono">
                                    $
                                    {Number(quotation.total).toLocaleString(
                                        "es-MX",
                                        { minimumFractionDigits: 2 }
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {quotation.notes && (
                        <div className="notes">
                            <div className="label">Notas y Condiciones</div>
                            <p>{quotation.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="footer">
                        <p>
                            Ccurity — Seguridad Electrónica Integral · Este
                            documento fue generado electrónicamente
                        </p>
                        <p style={{ marginTop: 2 }}>
                            Cotización válida por{" "}
                            {quotation.validUntil
                                ? Math.ceil(
                                    (new Date(quotation.validUntil).getTime() -
                                        new Date(
                                            quotation.createdAt
                                        ).getTime()) /
                                    86400000
                                )
                                : 30}{" "}
                            días a partir de su emisión
                        </p>
                    </div>
                </div>

                {/* Print button (hidden on print) */}
                <PrintButton />
            </body>
        </html>
    );
}
