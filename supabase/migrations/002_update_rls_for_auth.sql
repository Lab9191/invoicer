-- Migration: Update RLS policies to use Supabase Auth
-- This migration updates all Row Level Security policies to use real user authentication
-- instead of allowing all operations
--
-- NOTE: This migration is idempotent - safe to run multiple times

-- =============================================================================
-- PROFILES TABLE - RLS Policies
-- =============================================================================

-- Drop ALL possible old policies (safe with IF EXISTS)
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all to update profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all to delete profiles" ON profiles;

-- Create new secure policies (will only create if not exists due to drop above)
CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- CLIENTS TABLE - RLS Policies
-- =============================================================================

-- Drop ALL possible old policies
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients for their profiles" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Users can view clients for their profiles" ON clients;
DROP POLICY IF EXISTS "Users can update clients for their profiles" ON clients;
DROP POLICY IF EXISTS "Users can delete clients for their profiles" ON clients;
DROP POLICY IF EXISTS "Allow all to read clients" ON clients;
DROP POLICY IF EXISTS "Allow all to insert clients" ON clients;
DROP POLICY IF EXISTS "Allow all to update clients" ON clients;
DROP POLICY IF EXISTS "Allow all to delete clients" ON clients;

-- Create new secure policies
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = clients.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create clients for their profiles"
  ON clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = clients.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = clients.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = clients.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- =============================================================================
-- INVOICES TABLE - RLS Policies
-- =============================================================================

-- Drop ALL possible old policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices for their profiles" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view invoices for their profiles" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices for their profiles" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices for their profiles" ON invoices;
DROP POLICY IF EXISTS "Allow all to read invoices" ON invoices;
DROP POLICY IF EXISTS "Allow all to insert invoices" ON invoices;
DROP POLICY IF EXISTS "Allow all to update invoices" ON invoices;
DROP POLICY IF EXISTS "Allow all to delete invoices" ON invoices;

-- Create new secure policies
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = invoices.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoices for their profiles"
  ON invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = invoices.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = invoices.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own invoices"
  ON invoices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = invoices.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- =============================================================================
-- INVOICE_ITEMS TABLE - RLS Policies
-- =============================================================================

-- Drop ALL possible old policies
DROP POLICY IF EXISTS "Users can view their own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can create invoice items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can update their own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete their own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can view items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can create items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can update items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Allow all to read invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Allow all to insert invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Allow all to update invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Allow all to delete invoice_items" ON invoice_items;

-- Create new secure policies
CREATE POLICY "Users can view their own invoice items"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN profiles ON profiles.id = invoices.profile_id
      WHERE invoices.id = invoice_items.invoice_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoice items for their invoices"
  ON invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN profiles ON profiles.id = invoices.profile_id
      WHERE invoices.id = invoice_items.invoice_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invoice items"
  ON invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN profiles ON profiles.id = invoices.profile_id
      WHERE invoices.id = invoice_items.invoice_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own invoice items"
  ON invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN profiles ON profiles.id = invoices.profile_id
      WHERE invoices.id = invoice_items.invoice_id
      AND profiles.user_id = auth.uid()
    )
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Users can view their own profiles" ON profiles IS
  'Users can only view profiles where they are the owner (user_id matches auth.uid())';

COMMENT ON POLICY "Users can view their own clients" ON clients IS
  'Users can only view clients that belong to their profiles';

COMMENT ON POLICY "Users can view their own invoices" ON invoices IS
  'Users can only view invoices that belong to their profiles';

COMMENT ON POLICY "Users can view their own invoice items" ON invoice_items IS
  'Users can only view invoice items that belong to their invoices';
