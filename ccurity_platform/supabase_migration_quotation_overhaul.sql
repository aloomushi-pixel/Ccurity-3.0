-- =============================================================
-- QUOTATION SYSTEM OVERHAUL — Migration
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================

-- 1. quotation_templates table
CREATE TABLE IF NOT EXISTS quotation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    colors JSONB NOT NULL DEFAULT '{"primary":"#6c63ff","secondary":"#4a42d1","accent":"#ff6b6b","bg":"#ffffff","text":"#1a1a2e"}'::jsonb,
    font_family TEXT DEFAULT 'Inter, system-ui, sans-serif',
    logo_url TEXT,
    header_config JSONB DEFAULT '{}'::jsonb,
    footer_config JSONB DEFAULT '{}'::jsonb,
    css_overrides JSONB DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 2. company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Ccurity',
    legal_name TEXT,
    rfc TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    website TEXT,
    privacy_notice TEXT,
    default_terms TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Insert default company settings row
INSERT INTO company_settings (name, legal_name)
VALUES ('Ccurity', 'Ccurity Seguridad Electrónica Integral')
ON CONFLICT DO NOTHING;

-- 3. Modify quotations table
ALTER TABLE quotations
    ADD COLUMN IF NOT EXISTS "serviceTypeId" UUID REFERENCES service_types(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS "templateId" UUID REFERENCES quotation_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS "publishedToken" UUID DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "termsContent" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "privacyNotice" TEXT DEFAULT NULL;

-- Index for fast public lookups
CREATE INDEX IF NOT EXISTS idx_quotations_published_token ON quotations("publishedToken") WHERE "publishedToken" IS NOT NULL;

-- 4. quotation_tabs table
CREATE TABLE IF NOT EXISTS quotation_tabs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "quotationId" UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    section TEXT NOT NULL CHECK (section IN ('equipos', 'materiales', 'mano_de_obra')),
    label TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_tabs_quotation ON quotation_tabs("quotationId");

-- 5. quotation_tab_links table
CREATE TABLE IF NOT EXISTS quotation_tab_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "quotationId" UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    "sourceTabId" UUID NOT NULL REFERENCES quotation_tabs(id) ON DELETE CASCADE,
    "targetTabId" UUID NOT NULL REFERENCES quotation_tabs(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    UNIQUE("sourceTabId", "targetTabId")
);

-- 6. Modify quotation_items table
ALTER TABLE quotation_items
    ADD COLUMN IF NOT EXISTS "tabId" UUID REFERENCES quotation_tabs(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS section TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "isCustom" BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS "customTitle" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "customDescription" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "customFormat" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "customPrice" NUMERIC DEFAULT NULL;

-- Drop old tab_id column if it exists and is different from tabId
-- (the old schema had tab_id as text, new one is UUID FK)
-- Only run if needed:
-- ALTER TABLE quotation_items DROP COLUMN IF EXISTS tab_id;

CREATE INDEX IF NOT EXISTS idx_quotation_items_tab ON quotation_items("tabId");

-- 7. Modify service_types table — add terms fields
ALTER TABLE service_types
    ADD COLUMN IF NOT EXISTS "termsUrl" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "termsContent" TEXT DEFAULT NULL;

-- 8. Insert default templates (Dark + Light)
INSERT INTO quotation_templates (name, theme, colors, font_family, is_default) VALUES
(
    'Elegante Oscura',
    'dark',
    '{"primary":"#6c63ff","secondary":"#4a42d1","accent":"#00d4aa","bg":"#0f0f23","text":"#e4e4f0","surface":"#1a1a3e","border":"#2d2d5e"}'::jsonb,
    'Inter, system-ui, sans-serif',
    true
),
(
    'Profesional Clara',
    'light',
    '{"primary":"#6c63ff","secondary":"#4a42d1","accent":"#ff6b6b","bg":"#ffffff","text":"#1a1a2e","surface":"#f8f8ff","border":"#e8e6ff"}'::jsonb,
    'Inter, system-ui, sans-serif',
    false
);

-- 9. RLS Policies

-- quotation_templates: readable by authenticated, manageable by admins
ALTER TABLE quotation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates readable by authenticated"
    ON quotation_templates FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Templates manageable by admins"
    ON quotation_templates FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- company_settings: readable by authenticated, manageable by admins
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings readable by authenticated"
    ON company_settings FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Settings manageable by admins"
    ON company_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- quotation_tabs: follow parent quotation access
ALTER TABLE quotation_tabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tabs follow quotation access"
    ON quotation_tabs FOR ALL
    TO authenticated USING (true);

-- quotation_tab_links: follow parent quotation access
ALTER TABLE quotation_tab_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tab links follow quotation access"
    ON quotation_tab_links FOR ALL
    TO authenticated USING (true);

-- Public access for published quotations (for the public URL)
-- We need a policy on quotations for anon access via published token
CREATE POLICY "Public can read published quotations"
    ON quotations FOR SELECT
    TO anon
    USING ("publishedToken" IS NOT NULL AND "publishedAt" IS NOT NULL);

CREATE POLICY "Public can read items of published quotations"
    ON quotation_items FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM quotations
            WHERE quotations.id = quotation_items."quotationId"
            AND quotations."publishedToken" IS NOT NULL
            AND quotations."publishedAt" IS NOT NULL
        )
    );

CREATE POLICY "Public can read tabs of published quotations"
    ON quotation_tabs FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM quotations
            WHERE quotations.id = quotation_tabs."quotationId"
            AND quotations."publishedToken" IS NOT NULL
            AND quotations."publishedAt" IS NOT NULL
        )
    );

CREATE POLICY "Public can read tab links of published quotations"
    ON quotation_tab_links FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM quotations
            WHERE quotations.id = quotation_tab_links."quotationId"
            AND quotations."publishedToken" IS NOT NULL
            AND quotations."publishedAt" IS NOT NULL
        )
    );

CREATE POLICY "Public can read templates"
    ON quotation_templates FOR SELECT
    TO anon USING (true);

CREATE POLICY "Public can read company settings"
    ON company_settings FOR SELECT
    TO anon USING (true);
