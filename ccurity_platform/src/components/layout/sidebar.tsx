"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navConfig, NavItem } from "@/config/nav";
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
                    "fixed top-0 left-0 z-50 h-full w-64 bg-surface-1 dark:bg-surface-2 border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-border">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <span className="text-primary">✦</span> Ccurity
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
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-muted hover:bg-surface-2 hover:text-foreground"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 transition-transform group-hover:scale-110",
                                        isActive ? "text-white" : "text-muted group-hover:text-primary"
                                    )}
                                />
                                <span className="font-medium">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-border bg-surface-1/50 dark:bg-surface-2/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-2">
                        <ThemeToggle />
                        <button className="text-sm text-muted hover:text-danger flex items-center gap-2 transition-colors">
                            <LogOut size={16} />
                            <span>Salir</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
