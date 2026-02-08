-- Hito 6: Finanzas y Contratos — Run this in the Supabase SQL Editor

-- 1. Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  "quotationId" UUID REFERENCES quotations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  "startDate" DATE NOT NULL DEFAULT CURRENT_DATE,
  "endDate" DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','cancelled')),
  "signedAt" TIMESTAMPTZ,
  "documentUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contractId" UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'transfer' CHECK (method IN ('transfer','cash','card','check')),
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected')),
  "paidAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contractId" UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  folio TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
  "issuedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "dueDate" DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
