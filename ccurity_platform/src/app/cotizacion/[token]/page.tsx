import { notFound } from "next/navigation";
import { getQuotationByToken, getCompanySettings } from "@/lib/data/quotations";

export const dynamic = "force-dynamic";

export default async function PublishedQuotationPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const [quotation, company] = await Promise.all([
        getQuotationByToken(token),
        getCompanySettings(),
    ]);

    if (!quotation) return notFound();

    const template = quotation.template;
    const colors = template?.colors || {
        primary: "#6c63ff",
        secondary: "#4a42d1",
        accent: "#00d4aa",
        bg: "#0f0f23",
        text: "#e4e4f0",
        surface: "#1a1a3e",
        border: "#2d2d5e",
    };
    const isDark = template?.theme === "dark";

    // Group tabs by section
    const tabs = quotation.quotation_tabs || [];
    const sections: Record<string, typeof tabs> = {};
    for (const tab of tabs) {
        if (!sections[tab.section]) sections[tab.section] = [];
        sections[tab.section].push(tab);
    }

    // Group items by tabId
    const itemsByTab: Record<string, typeof quotation.quotation_items> = {};
    for (const item of quotation.quotation_items || []) {
        const tabId = item.tabId || "general";
        if (!itemsByTab[tabId]) itemsByTab[tabId] = [];
        itemsByTab[tabId].push(item);
    }

    const sectionLabels: Record<string, { icon: string; title: string }> = {
        equipos: { icon: "📦", title: "Equipos" },
        materiales: { icon: "🔧", title: "Materiales" },
        mano_de_obra: { icon: "👷", title: "Mano de Obra" },
    };

    const validDate = quotation.validUntil
        ? new Date(quotation.validUntil).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : null;

    const createdDate = new Date(quotation.createdAt).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    // Bank transfer discount — offsets Stripe's 3.6% + $3 MXN fee
    const totalNum = Number(quotation.total) || 0;
    const stripeFee = totalNum * 0.036 + 3;
    const transferTotal = Math.max(0, totalNum - stripeFee);
    const discountPercent = totalNum > 0 ? ((stripeFee / totalNum) * 100).toFixed(1) : "0";

    return (
        <html lang="es">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{quotation.title} — {company?.name || "Cotización"}</title>
                {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                        :root {
                            --primary: ${colors.primary};
                            --secondary: ${colors.secondary};
                            --accent: ${colors.accent};
                            --bg: ${colors.bg};
                            --text: ${colors.text};
                            --surface: ${colors.surface || (isDark ? "#1a1a3e" : "#f8f8ff")};
                            --border: ${colors.border || (isDark ? "#2d2d5e" : "#e8e6ff")};
                        }
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: ${template?.font_family || "'Inter', system-ui, sans-serif"};
                            background: var(--bg);
                            color: var(--text);
                            line-height: 1.6;
                            min-height: 100vh;
                        }
                        .container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
                        .header {
                            text-align: center;
                            padding: 2.5rem 2rem;
                            background: var(--surface);
                            border-radius: 16px;
                            border: 1px solid var(--border);
                            margin-bottom: 2rem;
                        }
                        .company-name {
                            font-size: 0.75rem;
                            text-transform: uppercase;
                            letter-spacing: 0.2em;
                            opacity: 0.6;
                            margin-bottom: 0.5rem;
                        }
                        .quote-title {
                            font-size: 1.75rem;
                            font-weight: 700;
                            background: linear-gradient(135deg, var(--primary), var(--accent));
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            margin-bottom: 1rem;
                        }
                        .meta { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; }
                        .meta-item {
                            font-size: 0.8rem;
                            opacity: 0.7;
                        }
                        .meta-item strong { opacity: 1; }
                        .card {
                            background: var(--surface);
                            border: 1px solid var(--border);
                            border-radius: 12px;
                            margin-bottom: 1.5rem;
                            overflow: hidden;
                        }
                        .card-header {
                            padding: 1rem 1.5rem;
                            border-bottom: 1px solid var(--border);
                            font-weight: 600;
                            font-size: 0.95rem;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        }
                        .tab-bar {
                            display: flex;
                            gap: 0.25rem;
                            padding: 0.75rem 1.5rem 0;
                            border-bottom: 1px solid var(--border);
                        }
                        .tab-btn {
                            padding: 0.5rem 1rem;
                            font-size: 0.75rem;
                            font-weight: 500;
                            border: none;
                            background: transparent;
                            color: var(--text);
                            opacity: 0.5;
                            cursor: pointer;
                            border-bottom: 2px solid transparent;
                            transition: all 0.2s;
                        }
                        .tab-btn.active, .tab-btn:hover {
                            opacity: 1;
                            border-bottom-color: var(--primary);
                        }
                        table { width: 100%; border-collapse: collapse; }
                        th {
                            text-align: left;
                            padding: 0.75rem 1rem;
                            font-size: 0.7rem;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.1em;
                            opacity: 0.5;
                            border-bottom: 1px solid var(--border);
                        }
                        td {
                            padding: 0.75rem 1rem;
                            font-size: 0.85rem;
                            border-bottom: 1px solid color-mix(in srgb, var(--border) 30%, transparent);
                        }
                        tr:last-child td { border-bottom: none; }
                        .text-right { text-align: right; }
                        .mono { font-family: 'SF Mono', 'Fira Code', monospace; }
                        .custom-badge {
                            display: inline-block;
                            font-size: 0.6rem;
                            padding: 0.15rem 0.4rem;
                            border-radius: 4px;
                            background: color-mix(in srgb, var(--accent) 15%, transparent);
                            color: var(--accent);
                            margin-left: 0.4rem;
                            vertical-align: middle;
                        }
                        .totals {
                            padding: 1.5rem;
                        }
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 0.4rem 0;
                            font-size: 0.85rem;
                        }
                        .total-row.grand {
                            font-size: 1.1rem;
                            font-weight: 700;
                            padding-top: 0.75rem;
                            margin-top: 0.5rem;
                            border-top: 2px solid var(--primary);
                        }
                        .total-row.grand .amount {
                            background: linear-gradient(135deg, var(--primary), var(--accent));
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                        }
                        .terms-card { padding: 1.5rem; }
                        .terms-card h3 { font-size: 0.85rem; margin-bottom: 0.75rem; }
                        .terms-content {
                            font-size: 0.75rem;
                            opacity: 0.6;
                            white-space: pre-wrap;
                            line-height: 1.8;
                        }
                        /* Payment CTA */
                        .payment-card {
                            background: var(--surface);
                            border: 2px solid var(--primary);
                            border-radius: 16px;
                            margin-bottom: 1.5rem;
                            overflow: hidden;
                            text-align: center;
                            padding: 2rem;
                        }
                        .payment-card.paid {
                            border-color: #22c55e;
                        }
                        .pay-btn {
                            display: inline-flex;
                            align-items: center;
                            gap: 0.5rem;
                            padding: 1rem 2.5rem;
                            font-size: 1.1rem;
                            font-weight: 700;
                            color: #fff;
                            background: linear-gradient(135deg, var(--primary), var(--accent));
                            border: none;
                            border-radius: 12px;
                            cursor: pointer;
                            text-decoration: none;
                            transition: all 0.3s;
                            box-shadow: 0 4px 20px color-mix(in srgb, var(--primary) 40%, transparent);
                        }
                        .pay-btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 8px 30px color-mix(in srgb, var(--primary) 50%, transparent);
                        }
                        .payment-status {
                            display: inline-flex;
                            align-items: center;
                            gap: 0.4rem;
                            font-size: 0.8rem;
                            padding: 0.4rem 1rem;
                            border-radius: 20px;
                            margin-bottom: 1rem;
                        }
                        .status-pending {
                            background: color-mix(in srgb, #f59e0b 15%, transparent);
                            color: #f59e0b;
                        }
                        .status-paid {
                            background: color-mix(in srgb, #22c55e 15%, transparent);
                            color: #22c55e;
                        }
                        .payment-amount {
                            font-size: 2rem;
                            font-weight: 700;
                            background: linear-gradient(135deg, var(--primary), var(--accent));
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            margin: 0.5rem 0 1rem;
                        }
                        .payment-label {
                            font-size: 0.75rem;
                            opacity: 0.5;
                            text-transform: uppercase;
                            letter-spacing: 0.15em;
                        }
                        .paid-check {
                            font-size: 3rem;
                            margin-bottom: 0.5rem;
                        }
                        /* Bank transfer card */
                        .transfer-card {
                            background: var(--surface);
                            border: 2px dashed var(--accent);
                            border-radius: 16px;
                            margin-bottom: 1.5rem;
                            overflow: hidden;
                            padding: 2rem;
                        }
                        .transfer-header {
                            display: flex;
                            align-items: center;
                            gap: 0.6rem;
                            font-size: 1.1rem;
                            font-weight: 700;
                            margin-bottom: 1rem;
                        }
                        .transfer-discount-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 0.3rem;
                            padding: 0.3rem 0.8rem;
                            background: color-mix(in srgb, #22c55e 15%, transparent);
                            color: #22c55e;
                            font-size: 0.75rem;
                            font-weight: 600;
                            border-radius: 20px;
                            margin-bottom: 1rem;
                        }
                        .transfer-grid {
                            display: grid;
                            grid-template-columns: auto 1fr;
                            gap: 0.4rem 1rem;
                            font-size: 0.85rem;
                            margin-bottom: 1.25rem;
                            text-align: left;
                        }
                        .transfer-grid dt {
                            opacity: 0.5;
                            font-weight: 500;
                            white-space: nowrap;
                        }
                        .transfer-grid dd {
                            margin: 0;
                            font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
                            font-weight: 600;
                            word-break: break-all;
                        }
                        .transfer-amount {
                            text-align: center;
                            margin-top: 1.25rem;
                            padding-top: 1.25rem;
                            border-top: 1px solid var(--border);
                        }
                        .transfer-amount .label {
                            font-size: 0.7rem;
                            opacity: 0.5;
                            text-transform: uppercase;
                            letter-spacing: 0.15em;
                            margin-bottom: 0.25rem;
                        }
                        .transfer-amount .original {
                            font-size: 0.8rem;
                            opacity: 0.4;
                            text-decoration: line-through;
                        }
                        .transfer-amount .discounted {
                            font-size: 1.8rem;
                            font-weight: 700;
                            color: #22c55e;
                        }
                        .transfer-amount .savings {
                            font-size: 0.75rem;
                            color: #22c55e;
                            opacity: 0.8;
                            margin-top: 0.25rem;
                        }
                        .transfer-note {
                            font-size: 0.7rem;
                            opacity: 0.4;
                            margin-top: 1rem;
                            text-align: center;
                        }
                        .or-divider {
                            text-align: center;
                            font-size: 0.75rem;
                            opacity: 0.3;
                            text-transform: uppercase;
                            letter-spacing: 0.2em;
                            padding: 0.5rem 0;
                        }
                        .footer {
                            text-align: center;
                            padding: 2rem;
                            font-size: 0.7rem;
                            opacity: 0.4;
                        }
                        @media (max-width: 640px) {
                            .container { padding: 1rem; }
                            .header { padding: 1.5rem 1rem; }
                            .quote-title { font-size: 1.3rem; }
                            .meta { gap: 1rem; }
                            .pay-btn { width: 100%; justify-content: center; }
                        }
                        @media print {
                            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                            .container { max-width: 100%; padding: 0; }
                            .payment-card { display: none; }
                            .transfer-card { display: none; }
                            .or-divider { display: none; }
                        }
                    `,
                    }}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        function showTab(sectionId, tabIdx) {
                            var section = document.getElementById(sectionId);
                            if (!section) return;
                            var panes = section.querySelectorAll('.tab-pane');
                            var btns = section.querySelectorAll('.tab-btn');
                            panes.forEach(function(p, i) {
                                p.style.display = i === tabIdx ? 'block' : 'none';
                            });
                            btns.forEach(function(b, i) {
                                if (i === tabIdx) b.classList.add('active');
                                else b.classList.remove('active');
                            });
                        }
                    `,
                    }}
                />
            </head>
            <body>
                <div className="container">
                    {/* Header */}
                    <div className="header">
                        <div className="company-name">{company?.name || "Ccurity"}</div>
                        <h1 className="quote-title">{quotation.title}</h1>
                        <div className="meta">
                            {quotation.folio && (
                                <div className="meta-item">
                                    <strong>Folio:</strong> {quotation.folio}
                                </div>
                            )}
                            <div className="meta-item">
                                <strong>Fecha:</strong> {createdDate}
                            </div>
                            {validDate && (
                                <div className="meta-item">
                                    <strong>Vigencia:</strong> {validDate}
                                </div>
                            )}
                            <div className="meta-item">
                                <strong>Versión:</strong> {quotation.version}
                            </div>
                        </div>
                    </div>

                    {/* Client info */}
                    {quotation.client && (
                        <div className="card">
                            <div className="card-header">👤 Cliente</div>
                            <div style={{ padding: "1rem 1.5rem" }}>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                                    {quotation.client.name}
                                </div>
                                <div style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.25rem" }}>
                                    {quotation.client.email}
                                    {quotation.client.phone && ` · ${quotation.client.phone}`}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sections */}
                    {Object.entries(sections)
                        .sort(([a], [b]) => {
                            const order = ["equipos", "materiales", "mano_de_obra"];
                            return order.indexOf(a) - order.indexOf(b);
                        })
                        .map(([section, sectionTabs]) => {
                            const label = sectionLabels[section] || { icon: "📋", title: section };
                            return (
                                <div className="card" key={section} id={`section-${section}`}>
                                    <div className="card-header">
                                        {label.icon} {label.title}
                                    </div>

                                    {sectionTabs.length > 1 && (
                                        <div className="tab-bar">
                                            {sectionTabs.map((tab, idx) => (
                                                <button
                                                    key={tab.id}
                                                    className={`tab-btn${idx === 0 ? " active" : ""}`}
                                                    onClick={() => { }}
                                                    data-section={`section-${section}`}
                                                    data-tab-idx={idx}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {sectionTabs.map((tab, idx) => {
                                        const tabItems = itemsByTab[tab.id] || [];
                                        return (
                                            <div
                                                key={tab.id}
                                                className="tab-pane"
                                                style={{ display: idx === 0 ? "block" : "none" }}
                                            >
                                                {tabItems.length > 0 ? (
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: "40px" }}>#</th>
                                                                <th>Concepto</th>
                                                                <th className="text-right" style={{ width: "60px" }}>
                                                                    Cant.
                                                                </th>
                                                                <th className="text-right" style={{ width: "120px" }}>
                                                                    P. Unitario
                                                                </th>
                                                                <th className="text-right" style={{ width: "120px" }}>
                                                                    Total
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {tabItems.map((item, i) => (
                                                                <tr key={item.id}>
                                                                    <td style={{ opacity: 0.4 }}>{i + 1}</td>
                                                                    <td>
                                                                        {item.isCustom
                                                                            ? item.customTitle
                                                                            : item.concept?.title || "—"}
                                                                        {item.isCustom && (
                                                                            <span className="custom-badge">
                                                                                personalizado
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="text-right mono">
                                                                        {item.quantity}
                                                                    </td>
                                                                    <td className="text-right mono">
                                                                        $
                                                                        {Number(
                                                                            item.unitPrice
                                                                        ).toLocaleString("es-MX", {
                                                                            minimumFractionDigits: 2,
                                                                        })}
                                                                    </td>
                                                                    <td className="text-right mono">
                                                                        $
                                                                        {Number(
                                                                            item.total
                                                                        ).toLocaleString("es-MX", {
                                                                            minimumFractionDigits: 2,
                                                                        })}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div
                                                        style={{
                                                            padding: "2rem",
                                                            textAlign: "center",
                                                            opacity: 0.4,
                                                            fontSize: "0.8rem",
                                                        }}
                                                    >
                                                        Sin conceptos en esta pestaña
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}

                    {/* Totals */}
                    <div className="card">
                        <div className="card-header">📊 Resumen de Precios</div>
                        <div className="totals">
                            {Object.entries(sections).map(([section, sectionTabs]) => {
                                const sectionTotal = sectionTabs.reduce((sum, tab) => {
                                    const tabItems = itemsByTab[tab.id] || [];
                                    return (
                                        sum +
                                        tabItems.reduce(
                                            (s, i) => s + Number(i.total),
                                            0
                                        )
                                    );
                                }, 0);
                                const label = sectionLabels[section] || { icon: "📋", title: section };
                                return (
                                    <div className="total-row" key={section}>
                                        <span style={{ opacity: 0.6 }}>
                                            {label.icon} {label.title}
                                        </span>
                                        <span className="mono">
                                            $
                                            {sectionTotal.toLocaleString("es-MX", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div
                                className="total-row"
                                style={{
                                    marginTop: "0.75rem",
                                    paddingTop: "0.75rem",
                                    borderTop: `1px solid var(--border)`,
                                }}
                            >
                                <span>Subtotal</span>
                                <span className="mono">
                                    $
                                    {Number(quotation.subtotal).toLocaleString("es-MX", {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            <div className="total-row">
                                <span style={{ opacity: 0.6 }}>IVA (16%)</span>
                                <span className="mono">
                                    $
                                    {Number(quotation.tax).toLocaleString("es-MX", {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            <div className="total-row grand">
                                <span>Total</span>
                                <span className="amount mono">
                                    $
                                    {Number(quotation.total).toLocaleString("es-MX", {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment CTA */}
                    {quotation.stripePaymentLinkUrl && (
                        <div className={`payment-card${quotation.paymentStatus === "paid" ? " paid" : ""}`}>
                            {quotation.paymentStatus === "paid" ? (
                                <>
                                    <div className="paid-check">✅</div>
                                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#22c55e" }}>
                                        ¡Pago recibido!
                                    </div>
                                    <div style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.5rem" }}>
                                        Tu pago ha sido procesado exitosamente.
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="payment-label">Total a pagar</div>
                                    <div className="payment-amount">
                                        ${Number(quotation.total).toLocaleString("es-MX", {
                                            minimumFractionDigits: 2,
                                        })} MXN
                                    </div>
                                    {quotation.paymentStatus === "pending" && (
                                        <div className="payment-status status-pending">
                                            ⏳ Pago pendiente
                                        </div>
                                    )}
                                    <div>
                                        <a
                                            href={quotation.stripePaymentLinkUrl}
                                            className="pay-btn"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            💳 Pagar ahora
                                        </a>
                                    </div>
                                    <div style={{ fontSize: "0.7rem", opacity: 0.4, marginTop: "1rem" }}>
                                        Pago seguro procesado por Stripe · Aceptamos tarjetas de crédito y débito
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Bank Transfer Alternative */}
                    {quotation.paymentStatus !== "paid" && totalNum > 0 && (
                        <>
                            {quotation.stripePaymentLinkUrl && (
                                <div className="or-divider">— o bien —</div>
                            )}
                            <div className="transfer-card">
                                <div className="transfer-header">
                                    🏦 Pago por transferencia bancaria
                                </div>
                                <div className="transfer-discount-badge">
                                    🎉 Ahorra {discountPercent}% pagando por transferencia
                                </div>
                                <dl className="transfer-grid">
                                    <dt>Beneficiario</dt>
                                    <dd>C-CURITY PROVEEDORES DE SEGURIDAD PRIVADA S.A. DE C.V.</dd>
                                    <dt>RFC</dt>
                                    <dd>CPS250211JX3</dd>
                                    <dt>Banco</dt>
                                    <dd>BBVA Bancomer</dd>
                                    <dt>Cuenta</dt>
                                    <dd>012 468 7663</dd>
                                    <dt>CLABE</dt>
                                    <dd>012 180 0012468 7663 3</dd>
                                </dl>
                                <div className="transfer-amount">
                                    <div className="label">Total con descuento por transferencia</div>
                                    <div className="original">
                                        ${totalNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                                    </div>
                                    <div className="discounted">
                                        ${transferTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                                    </div>
                                    <div className="savings">
                                        Ahorras ${stripeFee.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                                    </div>
                                </div>
                                <div className="transfer-note">
                                    Envía tu comprobante de pago a ventas@ccurity.com.mx o por WhatsApp al 55 8087 5650
                                </div>
                            </div>
                        </>
                    )}

                    {/* Terms */}
                    {quotation.termsContent && (
                        <div className="card">
                            <div className="terms-card">
                                <h3>📝 Términos y Condiciones</h3>
                                <div className="terms-content">{quotation.termsContent}</div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {quotation.notes && (
                        <div className="card">
                            <div className="terms-card">
                                <h3>💬 Notas</h3>
                                <div className="terms-content">{quotation.notes}</div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="footer">
                        <p>
                            {company?.name || "Ccurity"}{" "}
                            {company?.legal_name && `· ${company.legal_name}`}
                        </p>
                        {company?.phone && <p>{company.phone}</p>}
                        {company?.email && <p>{company.email}</p>}
                        {company?.website && <p>{company.website}</p>}
                        <p style={{ marginTop: "0.75rem" }}>
                            Cotización generada digitalmente. Este documento es válido sin firma.
                        </p>
                    </div>
                </div>

                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        document.querySelectorAll('.tab-btn').forEach(function(btn) {
                            btn.addEventListener('click', function() {
                                var sectionId = btn.getAttribute('data-section');
                                var tabIdx = parseInt(btn.getAttribute('data-tab-idx'));
                                showTab(sectionId, tabIdx);
                            });
                        });
                    `,
                    }}
                />
            </body>
        </html >
    );
}
