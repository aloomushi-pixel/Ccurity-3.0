# 📄 ESPECIFICACIONES MAESTRAS: PROYECTO-CCURITY

## 🎯 PROPÓSITO
Plataforma integral de gestión para empresas de seguridad electrónica. Resuelve la fragmentación de procesos conectando ventas, operaciones técnicas y clientes en un solo ecosistema.

## 🏗️ ARQUITECTURA (4 PILARES)

### 1. PUNTA (Visión Global)
ERP especializado con trazabilidad total: Cotización -> Venta -> Servicio -> Post-Venta.

### 2. PILAR IZQ (Frontend & UX)
- **Stack**: Next.js, Tailwind, Shadcn/UI.
- **Formato**: Webapp responsive con capacidades PWA para técnicos en campo.

### 3. PILAR CENTRAL (Lógica & Backend)
- **Núcleo**: Gestión de CPU (Precios Unitarios), Cotizaciones con versionado, Contratos Digitales.
- **Servicios**: Gestión de micro-apps dinámicas por tipo de servicio.
- **Finanzas**: Estados de cuenta, facturación y control de ingresos/egresos.
- **Automatización**: Recordatorios multicanal.

### 4. PILAR DERECHO (Interfaces)
- **Admin**: Configuración global y gestión de usuarios senior.
- **Supervisor**: Auditoría de servicios y monitoreo de chats.
- **Colaborador**: App operativa para técnicos con visualización de contratos y estados de cuenta.
- **Cliente**: Portal de autoservicio para seguimiento, pagos y gestión de disputas.

## 🛡️ REGLAS DE ORQUESTACIÓN
1. **Autonomía**: El agente tiene permiso para proponer e implementar soluciones técnicas sin confirmación constante.
2. **Consistencia**: Cada nuevo módulo debe ser registrado en el archivo de progreso.
3. **Seguridad**: Los módulos de chat y finanzas deben seguir los skills de seguridad seleccionados.
