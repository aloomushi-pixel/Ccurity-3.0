export default function PrintLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Minimal layout for print pages — no root styles or nav
    return children;
}
