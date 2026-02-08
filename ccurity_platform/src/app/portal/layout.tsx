import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UserNav } from "@/components/user-nav";
import { FloatingChat } from "@/components/chat/FloatingChat";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardShell role="portal" userNav={<UserNav />}>
            {children}
            <FloatingChat />
        </DashboardShell>
    );
}
