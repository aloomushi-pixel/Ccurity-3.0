import * as React from "react";

interface NotificationEmailProps {
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
}

export function NotificationEmail({
    title,
    message,
    actionUrl,
    actionLabel = "Ver en Ccurity",
}: NotificationEmailProps) {
    return (
        <div
            style={{
                fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                maxWidth: "600px",
                margin: "0 auto",
                padding: "0",
                backgroundColor: "#f8fafc",
            }}
        >
            {/* Header */}
            <div
                style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    padding: "32px 24px",
                    textAlign: "center" as const,
                    borderRadius: "12px 12px 0 0",
                }}
            >
                <h1
                    style={{
                        color: "#ffffff",
                        fontSize: "24px",
                        fontWeight: "700",
                        margin: "0",
                        letterSpacing: "-0.025em",
                    }}
                >
                    Ccurity
                </h1>
                <p
                    style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "12px",
                        margin: "4px 0 0 0",
                    }}
                >
                    Plataforma de Gestión para Seguridad Electrónica
                </p>
            </div>

            {/* Body */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    padding: "32px 24px",
                }}
            >
                <h2
                    style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#0f172a",
                        margin: "0 0 16px 0",
                    }}
                >
                    {title}
                </h2>
                <p
                    style={{
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: "#475569",
                        margin: "0 0 24px 0",
                    }}
                >
                    {message}
                </p>

                {actionUrl && (
                    <div style={{ textAlign: "center" as const }}>
                        <a
                            href={actionUrl}
                            style={{
                                display: "inline-block",
                                padding: "12px 32px",
                                backgroundColor: "#6366f1",
                                color: "#ffffff",
                                textDecoration: "none",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "600",
                            }}
                        >
                            {actionLabel}
                        </a>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: "20px 24px",
                    textAlign: "center" as const,
                    borderRadius: "0 0 12px 12px",
                }}
            >
                <p
                    style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        margin: "0",
                    }}
                >
                    © {new Date().getFullYear()} Ccurity.
                    Este email fue enviado desde app.ccurity.com.mx
                </p>
            </div>
        </div>
    );
}
