"use client";

import { Menu, Bell, Search } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
    title?: string;
    children?: React.ReactNode;
}

export function Header({ onMenuClick, children }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 h-16 px-6 bg-surface-1/60 dark:bg-surface-2/60 backdrop-blur-xl border-b border-border/50 flex items-center justify-between transition-all supports-[backdrop-filter]:bg-surface-1/60">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-muted hover:text-foreground rounded-lg hover:bg-surface-2/50 transition-colors"
                >
                    <Menu size={24} />
                </button>
                {/* Breadcrumb or Title could go here */}
                <div className="hidden md:flex relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="pl-10 pr-4 py-2 rounded-full bg-surface-2/50 dark:bg-surface-3/30 border border-transparent focus:border-primary/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all focus:w-80 placeholder:text-muted/70 backdrop-blur-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-surface-1 dark:ring-surface-2 animate-pulse"></span>
                </button>
                <div className="h-8 w-[1px] bg-border/50 mx-1"></div>
                {children}
            </div>
        </header>
    );
}
