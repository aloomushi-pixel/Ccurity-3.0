"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { navConfig } from "@/config/nav";

interface DashboardShellProps {
    children: React.ReactNode;
    userNav: React.ReactNode;
    role: keyof typeof navConfig;
}

export function DashboardShell({ children, userNav, role }: DashboardShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-dvh bg-background flex">
            {/* Sidebar */}
            <Sidebar
                role={role}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                >
                    {userNav}
                </Header>

                <main className="flex-1 p-4 md:p-6 overflow-x-hidden relative">
                    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
