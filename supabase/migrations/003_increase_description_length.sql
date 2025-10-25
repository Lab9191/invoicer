-- Increase description field length for invoice items to support long descriptions
ALTER TABLE invoice_items
ALTER COLUMN description TYPE text;

-- Add comment to clarify the purpose
COMMENT ON COLUMN invoice_items.description IS 'Item description - supports multi-line detailed descriptions';
