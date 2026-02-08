-- =============================================================
-- STRIPE INTEGRATION — Migration
-- Run this in your Supabase SQL Editor AFTER the quotation overhaul migration
-- =============================================================

-- Add Stripe fields to quotations table
ALTER TABLE quotations
    ADD COLUMN IF NOT EXISTS "stripeProductId" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "stripePaymentLinkId" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "stripePaymentLinkUrl" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT NULL CHECK ("paymentStatus" IN ('pending', 'paid', 'failed', 'refunded'));

-- Add Stripe customer ID to users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT DEFAULT NULL;

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_quotations_payment_status ON quotations("paymentStatus") WHERE "paymentStatus" IS NOT NULL;
