import { getEmails, getEmailStats } from "@/lib/data/emails";
import { EmailLayout } from "./email-layout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Correo — Ccurity Admin",
    description: "Gestión de correo electrónico de la plataforma.",
};

export default async function CorreoPage({
    searchParams,
}: {
    searchParams: Promise<{ folder?: string; search?: string }>;
}) {
    const params = await searchParams;
    const folder = params.folder || "inbox";
    const search = params.search;

    const [emails, stats] = await Promise.all([
        getEmails(folder, search),
        getEmailStats(),
    ]);

    return (
        <div className="flex flex-col h-[calc(100dvh-1px)]">
            {/* Header */}
            <div className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="text-muted hover:text-foreground transition-colors"
                    >
                        ← Regresar
                    </Link>
                    <h1 className="text-xl font-bold">📧 Correo Electrónico</h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    {stats.unread > 0 && (
                        <span className="px-2.5 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                            {stats.unread} sin leer
                        </span>
                    )}
                    <span className="text-muted">
                        <span className="font-semibold text-foreground">
                            {stats.total}
                        </span>{" "}
                        emails
                    </span>
                </div>
            </div>

            {/* Email client area */}
            <EmailLayout
                emails={emails}
                stats={stats}
                currentFolder={folder}
                searchQuery={search || ""}
            />
        </div>
    );
}
