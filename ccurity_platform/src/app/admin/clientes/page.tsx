import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";



async function getClientsData() {
    const supabase = await createClient();

    const { data: clients } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

    const { count: totalContracts } = await supabase
        .from("contracts")
        .select("id", { count: "exact", head: true });

    const { count: totalServices } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true });

    return {
        clients: clients ?? [],
        totalContracts: totalContracts ?? 0,
        totalServices: totalServices ?? 0,
    };
}

async function createClientAction(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const company = formData.get("company") as string;
    const address = formData.get("address") as string;
    const rfc = formData.get("rfc") as string;

    if (!name) return;

    await supabase.from("clients").insert({
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        address: address || null,
        rfc: rfc || null,
    });

    revalidatePath("/admin/clientes");
}

async function deleteClientAction(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    if (!id) return;
    await supabase.from("clients").delete().eq("id", id);
    revalidatePath("/admin/clientes");
}


export const metadata: Metadata = {
  title: "Clientes — Ccurity Admin",
  description: "Gestión de clientes y relaciones comerciales.",
};

export default async function AdminClientesPage() {
    const data = await getClientsData();

    return (
        <div className="min-h-dvh bg-background">
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-muted hover:text-foreground transition-colors text-sm">
                        ← Admin
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold">
                        🏢 <span className="gradient-text">Clientes</span>
                    </h1>
                </div>
                <UserNav />
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold">{data.clients.length}</p>
                        <p className="text-xs text-muted">Clientes</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold">{data.totalContracts}</p>
                        <p className="text-xs text-muted">Contratos</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold">{data.totalServices}</p>
                        <p className="text-xs text-muted">Servicios</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <p className="text-2xl font-bold">{data.clients.filter((c: any) => c.company).length}</p>
                        <p className="text-xs text-muted">Empresas</p>
                    </div>
                </div>

                {/* New client form */}
                <details className="glass-card overflow-hidden group">
                    <summary className="px-5 py-3 cursor-pointer flex items-center justify-between hover:bg-surface-2/50 transition-colors">
                        <h2 className="font-semibold text-sm">➕ Nuevo Cliente</h2>
                        <span className="text-xs text-muted group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <form action={createClientAction} className="px-5 py-4 border-t border-border space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-muted block mb-1">Nombre *</label>
                                <input name="name" required className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Juan Pérez" />
                            </div>
                            <div>
                                <label className="text-xs text-muted block mb-1">Empresa</label>
                                <input name="company" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Seguridad MX S.A." />
                            </div>
                            <div>
                                <label className="text-xs text-muted block mb-1">Email</label>
                                <input name="email" type="email" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="cliente@ejemplo.com" />
                            </div>
                            <div>
                                <label className="text-xs text-muted block mb-1">Teléfono</label>
                                <input name="phone" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="+52 55 1234 5678" />
                            </div>
                            <div>
                                <label className="text-xs text-muted block mb-1">RFC</label>
                                <input name="rfc" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="XAXX010101000" />
                            </div>
                            <div>
                                <label className="text-xs text-muted block mb-1">Dirección</label>
                                <input name="address" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Av. Reforma 123, CDMX" />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary text-sm px-6 py-2">Crear Cliente</button>
                    </form>
                </details>

                {/* Clients table */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-sm">🏢 Directorio de Clientes</h2>
                        <span className="text-xs text-muted">{data.clients.length} total</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-muted">
                                    <th className="px-4 py-2">Nombre</th>
                                    <th className="px-4 py-2">Empresa</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Teléfono</th>
                                    <th className="px-4 py-2">RFC</th>
                                    <th className="px-4 py-2">Registro</th>
                                    <th className="px-4 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.clients.length === 0 && (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Sin clientes registrados. Usa el formulario de arriba para crear el primero.</td></tr>
                                )}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {data.clients.map((c: any) => (
                                    <tr key={c.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <Link href={`/admin/clientes/${c.id}`} className="font-medium hover:text-primary-light transition-colors">
                                                {c.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2.5 text-muted">{c.company || "—"}</td>
                                        <td className="px-4 py-2.5 text-xs font-mono text-muted">{c.email || "—"}</td>
                                        <td className="px-4 py-2.5 text-muted">{c.phone || "—"}</td>
                                        <td className="px-4 py-2.5 text-xs font-mono text-muted">{c.rfc || "—"}</td>
                                        <td className="px-4 py-2.5 text-xs text-muted">
                                            {new Date(c.created_at).toLocaleDateString("es-MX")}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/clientes/${c.id}`} className="text-xs text-primary-light hover:underline">Ver</Link>
                                                <form action={deleteClientAction}>
                                                    <input type="hidden" name="id" value={c.id} />
                                                    <button type="submit" className="text-xs text-red-400 hover:underline">Eliminar</button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
