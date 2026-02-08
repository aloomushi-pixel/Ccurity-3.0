"use client";

import { Menu, Bell, Search } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
    title?: string;
    children?: React.ReactNode;
}

export function Header({ onMenuClick, title, children }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 h-16 px-6 bg-surface-1/80 dark:bg-surface-2/80 backdrop-blur-md border-b border-border flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-muted hover:text-foreground rounded-lg hover:bg-surface-2 transition-colors"
                >
                    <Menu size={24} />
                </button>
                {/* Breadcrumb or Title could go here */}
                <div className="hidden md:flex relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="pl-10 pr-4 py-2 rounded-full bg-surface-2 dark:bg-surface-3/50 border-none text-sm focus:ring-2 focus:ring-primary/50 outline-none w-64 transition-all focus:w-80 placeholder:text-muted/70"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted hover:text-foreground rounded-full hover:bg-surface-2 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-surface-1 dark:ring-surface-2 animate-pulse"></span>
                </button>
                <div className="h-8 w-[1px] bg-border mx-1"></div>
                {children}
            </div>
        </header>
    );
}
