import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UserNav } from "@/components/user-nav";
import { FloatingChat } from "@/components/chat/FloatingChat";

export default function SupervisorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardShell role="supervisor" userNav={<UserNav />}>
            {children}
            <FloatingChat />
        </DashboardShell>
    );
}
