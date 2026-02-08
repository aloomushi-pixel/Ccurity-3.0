import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UserNav } from "@/components/user-nav";
import { FloatingChat } from "@/components/chat/FloatingChat";

export default function ColaboradorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardShell role="colaborador" userNav={<UserNav />}>
            {children}
            <FloatingChat />
        </DashboardShell>
    );
}
