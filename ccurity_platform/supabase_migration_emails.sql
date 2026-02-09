-- Tabla para el gestor de correo electrónico
-- Almacena emails enviados y recibidos via Resend API

CREATE TABLE IF NOT EXISTS public.emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resend_id TEXT,
    direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
    from_address TEXT NOT NULL,
    to_addresses TEXT[] NOT NULL DEFAULT '{}',
    cc TEXT[] DEFAULT '{}',
    bcc TEXT[] DEFAULT '{}',
    subject TEXT NOT NULL DEFAULT '(Sin asunto)',
    html_body TEXT,
    text_body TEXT,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'bounced', 'received', 'failed')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_starred BOOLEAN NOT NULL DEFAULT false,
    folder TEXT NOT NULL DEFAULT 'inbox' CHECK (folder IN ('inbox', 'sent', 'drafts', 'trash')),
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX idx_emails_folder ON public.emails(folder);
CREATE INDEX idx_emails_direction ON public.emails(direction);
CREATE INDEX idx_emails_sent_by ON public.emails(sent_by);
CREATE INDEX idx_emails_created_at ON public.emails(created_at DESC);
CREATE INDEX idx_emails_is_read ON public.emails(is_read) WHERE is_read = false;

-- RLS: Solo admins pueden acceder
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Política: admins pueden leer todos los emails
CREATE POLICY "Admins can read all emails" ON public.emails
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Política: admins pueden insertar emails
CREATE POLICY "Admins can insert emails" ON public.emails
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Política: admins pueden actualizar emails
CREATE POLICY "Admins can update emails" ON public.emails
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Política: service_role puede insertar (para webhooks)
CREATE POLICY "Service role can insert emails" ON public.emails
    FOR INSERT
    WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_emails_updated_at
    BEFORE UPDATE ON public.emails
    FOR EACH ROW
    EXECUTE FUNCTION update_emails_updated_at();
