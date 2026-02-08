import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UserNav } from "@/components/user-nav";
import { FloatingChat } from "@/components/chat/FloatingChat";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardShell role="admin" userNav={<UserNav />}>
            {children}
            <FloatingChat />
        </DashboardShell>
    );
}
