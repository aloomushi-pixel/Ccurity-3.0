"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Inbox,
    Send,
    FileEdit,
    Trash2,
    Star,
    Search,
    RefreshCw,
    Mail,
    ChevronRight,
} from "lucide-react";
import type { Email, EmailStats } from "@/lib/data/emails";
import {
    markAsReadAction,
    toggleStarAction,
    moveToTrashAction,
} from "./actions";
import { ComposeModal } from "./compose-modal";

interface EmailLayoutProps {
    emails: Email[];
    stats: EmailStats;
    currentFolder: string;
    searchQuery: string;
}

const folders = [
    { key: "inbox", label: "Bandeja de Entrada", icon: Inbox },
    { key: "sent", label: "Enviados", icon: Send },
    { key: "drafts", label: "Borradores", icon: FileEdit },
    { key: "trash", label: "Papelera", icon: Trash2 },
];

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
        return d.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    if (hours < 168) {
        // 7 days
        return d.toLocaleDateString("es-MX", { weekday: "short" });
    }
    return d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
    });
}

function extractName(address: string): string {
    const match = address.match(/^(.+?)[\s]*<.+>$/);
    return match ? match[1].trim() : address.split("@")[0];
}

export function EmailLayout({
    emails,
    stats,
    currentFolder,
    searchQuery,
}: EmailLayoutProps) {
    const router = useRouter();
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [showCompose, setShowCompose] = useState(false);
    const [search, setSearch] = useState(searchQuery);
    const [isPending, startTransition] = useTransition();

    function navigateFolder(folder: string) {
        setSelectedEmail(null);
        router.push(`/admin/correo?folder=${folder}`);
    }

    function handleSearch() {
        const params = new URLSearchParams();
        params.set("folder", currentFolder);
        if (search) params.set("search", search);
        router.push(`/admin/correo?${params.toString()}`);
    }

    function handleSelectEmail(email: Email) {
        setSelectedEmail(email);
        if (!email.is_read) {
            startTransition(() => {
                markAsReadAction(email.id);
            });
        }
    }

    function handleToggleStar(e: React.MouseEvent, emailId: string) {
        e.stopPropagation();
        startTransition(() => {
            toggleStarAction(emailId);
        });
    }

    function handleMoveToTrash(emailId: string) {
        startTransition(() => {
            moveToTrashAction(emailId);
        });
        setSelectedEmail(null);
    }

    function getFolderCount(key: string): number {
        switch (key) {
            case "inbox":
                return stats.inbox;
            case "sent":
                return stats.sent;
            case "drafts":
                return stats.drafts;
            case "trash":
                return stats.trash;
            default:
                return 0;
        }
    }

    return (
        <>
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Carpetas */}
                <aside className="w-56 border-r border-border flex-shrink-0 flex flex-col bg-surface-1/50">
                    {/* Botón Nuevo Email */}
                    <div className="p-3">
                        <button
                            type="button"
                            onClick={() => setShowCompose(true)}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/25"
                        >
                            <Mail className="w-4 h-4" />
                            Nuevo Email
                        </button>
                    </div>

                    {/* Lista de carpetas */}
                    <nav className="flex-1 px-2 space-y-0.5">
                        {folders.map((folder) => {
                            const isActive = currentFolder === folder.key;
                            const count = getFolderCount(folder.key);
                            const Icon = folder.icon;
                            const unreadBadge =
                                folder.key === "inbox" && stats.unread > 0;

                            return (
                                <button
                                    type="button"
                                    key={folder.key}
                                    onClick={() => navigateFolder(folder.key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${isActive
                                            ? "bg-primary/15 text-primary font-semibold"
                                            : "text-muted hover:bg-surface-2 hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="flex-1 text-left">
                                        {folder.label}
                                    </span>
                                    {unreadBadge ? (
                                        <span className="px-1.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[20px] text-center">
                                            {stats.unread}
                                        </span>
                                    ) : count > 0 ? (
                                        <span className="text-xs text-muted">
                                            {count}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}

                        {/* Favoritos */}
                        <button
                            type="button"
                            onClick={() => {
                                /* TODO: starred filter */
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-foreground transition-all cursor-pointer"
                        >
                            <Star className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 text-left">Favoritos</span>
                            {stats.starred > 0 && (
                                <span className="text-xs text-muted">
                                    {stats.starred}
                                </span>
                            )}
                        </button>
                    </nav>
                </aside>

                {/* Lista de emails */}
                <div className="w-80 lg:w-96 border-r border-border flex flex-col flex-shrink-0">
                    {/* Barra de búsqueda */}
                    <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border focus-within:border-primary/50 transition-colors">
                                <Search className="w-4 h-4 text-muted flex-shrink-0" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleSearch()
                                    }
                                    placeholder="Buscar emails..."
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => router.refresh()}
                                className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                                title="Actualizar"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto">
                        {emails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <div className="text-4xl mb-3">📭</div>
                                <p className="text-muted text-sm">
                                    No hay emails en esta carpeta
                                </p>
                            </div>
                        ) : (
                            emails.map((email) => (
                                <button
                                    type="button"
                                    key={email.id}
                                    onClick={() => handleSelectEmail(email)}
                                    className={`w-full text-left px-4 py-3 border-b border-border/50 transition-all cursor-pointer ${selectedEmail?.id === email.id
                                            ? "bg-primary/10 border-l-2 border-l-primary"
                                            : email.is_read
                                                ? "hover:bg-surface-2/50"
                                                : "bg-surface-2/30 hover:bg-surface-2/50"
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {/* Starred */}
                                        <button
                                            type="button"
                                            onClick={(e) =>
                                                handleToggleStar(e, email.id)
                                            }
                                            className="mt-0.5 flex-shrink-0 cursor-pointer"
                                        >
                                            <Star
                                                className={`w-3.5 h-3.5 ${email.is_starred
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-muted hover:text-yellow-400"
                                                    }`}
                                            />
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`text-sm truncate ${!email.is_read
                                                            ? "font-semibold text-foreground"
                                                            : "text-foreground/80"
                                                        }`}
                                                >
                                                    {email.direction ===
                                                        "outbound"
                                                        ? `Para: ${email.to_addresses[0]}`
                                                        : extractName(
                                                            email.from_address
                                                        )}
                                                </span>
                                                <span className="text-[10px] text-muted flex-shrink-0">
                                                    {formatDate(
                                                        email.created_at
                                                    )}
                                                </span>
                                            </div>
                                            <p
                                                className={`text-xs mt-0.5 truncate ${!email.is_read
                                                        ? "text-foreground/70 font-medium"
                                                        : "text-muted"
                                                    }`}
                                            >
                                                {email.subject}
                                            </p>
                                            {email.text_body && (
                                                <p className="text-[11px] text-muted mt-0.5 truncate">
                                                    {email.text_body.slice(
                                                        0,
                                                        80
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        {!email.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Preview del email */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {selectedEmail ? (
                        <>
                            {/* Email header */}
                            <div className="p-6 border-b border-border flex-shrink-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-bold truncate">
                                            {selectedEmail.subject}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-2 text-sm">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {extractName(
                                                    selectedEmail.from_address
                                                )[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {extractName(
                                                        selectedEmail.from_address
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted">
                                                    {selectedEmail.from_address}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-muted">
                                            <ChevronRight className="w-3 h-3" />
                                            Para:{" "}
                                            {selectedEmail.to_addresses.join(
                                                ", "
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <span className="text-xs text-muted">
                                            {new Date(
                                                selectedEmail.created_at
                                            ).toLocaleString("es-MX")}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleStar(
                                                    {
                                                        stopPropagation: () => { },
                                                    } as React.MouseEvent,
                                                    selectedEmail.id
                                                )
                                            }
                                            className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                                        >
                                            <Star
                                                className={`w-4 h-4 ${selectedEmail.is_starred
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-muted"
                                                    }`}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMoveToTrash(
                                                    selectedEmail.id
                                                )
                                            }
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors cursor-pointer"
                                            title="Mover a papelera"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div className="mt-3 flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${selectedEmail.status === "delivered"
                                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                : selectedEmail.status ===
                                                    "bounced"
                                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                    : selectedEmail.status ===
                                                        "received"
                                                        ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                                                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                            }`}
                                    >
                                        {selectedEmail.status === "delivered"
                                            ? "✓ Entregado"
                                            : selectedEmail.status === "sent"
                                                ? "→ Enviado"
                                                : selectedEmail.status ===
                                                    "bounced"
                                                    ? "✗ Rebotado"
                                                    : selectedEmail.status ===
                                                        "received"
                                                        ? "↓ Recibido"
                                                        : selectedEmail.status}
                                    </span>
                                </div>
                            </div>

                            {/* Email body */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {selectedEmail.html_body ? (
                                    <div
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                        dangerouslySetInnerHTML={{
                                            __html: selectedEmail.html_body,
                                        }}
                                    />
                                ) : (
                                    <div className="whitespace-pre-wrap text-sm text-foreground/80">
                                        {selectedEmail.text_body ||
                                            "(Sin contenido)"}
                                    </div>
                                )}
                            </div>

                            {/* Reply bar */}
                            <div className="p-4 border-t border-border flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCompose(true);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-sm text-muted hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
                                >
                                    ↩ Responder
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📬</div>
                                <p className="text-muted text-lg">
                                    Selecciona un email para verlo
                                </p>
                                <p className="text-xs text-muted mt-1">
                                    o crea uno nuevo con el botón &quot;Nuevo
                                    Email&quot;
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal componer */}
            {showCompose && (
                <ComposeModal onClose={() => setShowCompose(false)} />
            )}
        </>
    );
}
