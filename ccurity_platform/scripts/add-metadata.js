const fs = require('fs');
const path = require('path');

// Map of file paths (relative to src/app) to their metadata
const metadataMap = {
    // Public pages
    'login/page.tsx': {
        title: 'Iniciar Sesión — Ccurity',
        description: 'Inicia sesión en tu cuenta de Ccurity para gestionar tu plataforma de seguridad electrónica.'
    },
    'signup/page.tsx': {
        title: 'Crear Cuenta — Ccurity',
        description: 'Regístrate en Ccurity, la plataforma integral para empresas de seguridad electrónica.'
    },
    // Role dashboards
    'admin/page.tsx': {
        title: 'Dashboard — Ccurity Admin',
        description: 'Panel administrativo de Ccurity. Gestión integral de usuarios, servicios, finanzas y operaciones.'
    },
    'supervisor/page.tsx': {
        title: 'Dashboard — Ccurity Supervisor',
        description: 'Panel de supervisión. Auditoría de servicios y monitoreo de operaciones.'
    },
    'colaborador/page.tsx': {
        title: 'Dashboard — Ccurity Colaborador',
        description: 'App operativa para técnicos en campo. Gestión de servicios asignados.'
    },
    'portal/page.tsx': {
        title: 'Portal del Cliente — Ccurity',
        description: 'Portal de autoservicio para clientes. Seguimiento de servicios, pagos y gestión.'
    },
    // Admin sub-pages
    'admin/usuarios/page.tsx': {
        title: 'Usuarios — Ccurity Admin',
        description: 'Gestión de usuarios, roles y permisos del sistema.'
    },
    'admin/servicios/page.tsx': {
        title: 'Servicios — Ccurity Admin',
        description: 'Gestión de servicios de seguridad electrónica, instalaciones y mantenimientos.'
    },
    'admin/finanzas/page.tsx': {
        title: 'Finanzas — Ccurity Admin',
        description: 'Control financiero, facturación y gestión de contratos.'
    },
    'admin/chat/page.tsx': {
        title: 'Chat — Ccurity Admin',
        description: 'Comunicación interna del equipo y soporte al cliente.'
    },
    'admin/reportes/page.tsx': {
        title: 'Reportes — Ccurity Admin',
        description: 'Reportes y analytics de la operación del negocio.'
    },
    'admin/config/page.tsx': {
        title: 'Configuración — Ccurity Admin',
        description: 'Configuración general del sistema y parámetros de la plataforma.'
    },
    'admin/calendario/page.tsx': {
        title: 'Calendario — Ccurity Admin',
        description: 'Calendario de servicios, instalaciones y mantenimientos programados.'
    },
    'admin/clientes/page.tsx': {
        title: 'Clientes — Ccurity Admin',
        description: 'Gestión de clientes y relaciones comerciales.'
    },
    'admin/cotizaciones/page.tsx': {
        title: 'Cotizaciones — Ccurity Admin',
        description: 'Creación y seguimiento de cotizaciones.'
    },
    'admin/disputas/page.tsx': {
        title: 'Disputas — Ccurity Admin',
        description: 'Gestión de disputas y reclamaciones de clientes.'
    },
    'admin/notificaciones/page.tsx': {
        title: 'Notificaciones — Ccurity Admin',
        description: 'Centro de notificaciones del sistema.'
    },
    'admin/audit/page.tsx': {
        title: 'Auditoría — Ccurity Admin',
        description: 'Registro de auditoría y trazabilidad de acciones del sistema.'
    },
    'admin/ayuda/page.tsx': {
        title: 'Ayuda — Ccurity Admin',
        description: 'Centro de ayuda y documentación de la plataforma.'
    },
    'admin/cpu/page.tsx': {
        title: 'Catálogo CPU — Ccurity Admin',
        description: 'Catálogo de productos y unidades del sistema.'
    },
};

const srcApp = path.join(__dirname, '..', 'src', 'app');
let updated = 0;
let skipped = 0;

for (const [relPath, meta] of Object.entries(metadataMap)) {
    const fullPath = path.join(srcApp, relPath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠ SKIP (not found): ${relPath}`);
        skipped++;
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');

    // Skip if already has metadata export
    if (content.includes('export const metadata')) {
        console.log(`⏭ SKIP (already has metadata): ${relPath}`);
        skipped++;
        continue;
    }

    // Check if it already imports Metadata type
    const hasMetadataImport = content.includes('Metadata');

    // Build the metadata block
    const metadataBlock = `\nexport const metadata: Metadata = {\n  title: "${meta.title}",\n  description: "${meta.description}",\n};\n`;

    if (hasMetadataImport) {
        // Just add metadata before the first export default
        const exportIdx = content.indexOf('export default');
        if (exportIdx !== -1) {
            content = content.slice(0, exportIdx) + metadataBlock + '\n' + content.slice(exportIdx);
        }
    } else {
        // Need to add import and metadata
        // Find the right place to add import - after existing imports
        const importStatement = `import type { Metadata } from "next";\n`;

        // Find the last import line
        const lines = content.split(/\r?\n/);
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIdx = i;
            }
        }

        if (lastImportIdx >= 0) {
            lines.splice(lastImportIdx + 1, 0, importStatement);
        } else {
            lines.unshift(importStatement);
        }

        content = lines.join('\n');

        // Now add metadata before export default
        const exportIdx = content.indexOf('export default');
        if (exportIdx !== -1) {
            content = content.slice(0, exportIdx) + metadataBlock + '\n' + content.slice(exportIdx);
        }
    }

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Updated: ${relPath}`);
    updated++;
}

console.log(`\nDone! Updated ${updated} files, skipped ${skipped}`);
