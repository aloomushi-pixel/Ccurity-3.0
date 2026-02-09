-- ============================================================
-- Migración: service_type_concepts (Plantillas de Levantamiento)
-- Vincular tipos de servicio con conceptos predeterminados
-- ============================================================

-- Tabla de plantillas: qué conceptos incluye cada tipo de servicio
CREATE TABLE IF NOT EXISTS service_type_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "serviceTypeId" UUID NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
    "conceptId" UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    "defaultQuantity" INT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE("serviceTypeId", "conceptId")
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_stc_service_type ON service_type_concepts("serviceTypeId");
CREATE INDEX IF NOT EXISTS idx_stc_concept ON service_type_concepts("conceptId");

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE service_type_concepts ENABLE ROW LEVEL SECURITY;

-- Admins: acceso completo
CREATE POLICY "Admins full access on service_type_concepts"
    ON service_type_concepts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Colaboradores: solo lectura
CREATE POLICY "Collaborators read service_type_concepts"
    ON service_type_concepts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('colaborador', 'supervisor')
        )
    );
