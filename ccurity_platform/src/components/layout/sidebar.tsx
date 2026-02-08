"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navConfig } from "@/config/nav";
import { cn } from "@/lib/utils"; // Assuming utils exists, if not I'll create it or inline clsx
import { X, LogOut } from "lucide-react";
import { ThemeToggle } from "../ui/theme-toggle";

type Role = keyof typeof navConfig;

interface SidebarProps {
    role: Role;
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const items = navConfig[role] || [];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-64 border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static",
                    "bg-surface-1/60 dark:bg-surface-2/60 backdrop-blur-xl supports-[backdrop-filter]:bg-surface-1/60",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent">✦</span> Ccurity
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 text-muted hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
                    {items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "text-white shadow-lg shadow-primary/25"
                                        : "text-muted hover:bg-surface-2/50 hover:text-foreground"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent opacity-100 z-0" />
                                )}
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 transition-transform group-hover:scale-110 relative z-10",
                                        isActive ? "text-white" : "text-muted group-hover:text-primary"
                                    )}
                                />
                                <span className="font-medium relative z-10">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-border/50 bg-gradient-to-t from-surface-1/80 to-transparent backdrop-blur-sm">
                    <div className="flex items-center justify-between px-2">
                        <ThemeToggle />
                        <button className="text-sm text-muted hover:text-danger flex items-center gap-2 transition-colors font-medium">
                            <LogOut size={16} />
                            <span>Salir</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
