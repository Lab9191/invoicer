import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
  client?: {
    id: string;
    name: string;
    email: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
    company_id: string | null;
    tax_id: string | null;
    vat_id: string | null;
  } | null;
}

/**
 * Get all invoices for a profile
 */
export async function getInvoices(profileId: string, filters?: {
  status?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<InvoiceWithItems[]> {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      client:clients (
        id,
        name,
        email,
        address,
        city,
        postal_code,
        country,
        company_id,
        tax_id,
        vat_id
      )
    `)
    .eq('profile_id', profileId)
    .order('issue_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.fromDate) {
    query = query.gte('issue_date', filters.fromDate);
  }

  if (filters?.toDate) {
    query = query.lte('issue_date', filters.toDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching invoices:', error);
    throw new Error(error.message);
  }

  // Fetch items for each invoice
  const invoicesWithItems: InvoiceWithItems[] = await Promise.all(
    (data || []).map(async (invoice) => {
      const items = await getInvoiceItems(invoice.id);
      return { ...invoice, items };
    })
  );

  return invoicesWithItems;
}

/**
 * Get a single invoice by ID with items
 */
export async function getInvoiceById(id: string): Promise<InvoiceWithItems | null> {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients (
        id,
        name,
        email,
        address,
        city,
        postal_code,
        country,
        company_id,
        tax_id,
        vat_id
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }

  const items = await getInvoiceItems(id);

  return { ...invoice, items };
}

/**
 * Get invoice items
 */
export async function getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching invoice items:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new invoice with items
 */
export async function createInvoice(
  invoice: InvoiceInsert,
  items: Omit<InvoiceItemInsert, 'invoice_id'>[]
): Promise<InvoiceWithItems> {
  // Create invoice
  const { data: newInvoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();

  if (invoiceError) {
    console.error('Error creating invoice:', invoiceError);
    throw new Error(invoiceError.message);
  }

  // Create invoice items
  const itemsWithInvoiceId = items.map((item, index) => ({
    ...item,
    invoice_id: newInvoice.id,
    sort_order: index,
  }));

  const { data: newItems, error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsWithInvoiceId)
    .select();

  if (itemsError) {
    console.error('Error creating invoice items:', itemsError);
    throw new Error(itemsError.message);
  }

  return { ...newInvoice, items: newItems || [], client: null };
}

/**
 * Update an existing invoice with items
 */
export async function updateInvoice(
  id: string,
  invoice: InvoiceUpdate,
  items: Omit<InvoiceItemInsert, 'invoice_id'>[]
): Promise<InvoiceWithItems> {
  // Update invoice
  const { data: updatedInvoice, error: invoiceError } = await supabase
    .from('invoices')
    .update(invoice)
    .eq('id', id)
    .select()
    .single();

  if (invoiceError) {
    console.error('Error updating invoice:', invoiceError);
    throw new Error(invoiceError.message);
  }

  // Delete existing items
  await supabase.from('invoice_items').delete().eq('invoice_id', id);

  // Create new items
  const itemsWithInvoiceId = items.map((item, index) => ({
    ...item,
    invoice_id: id,
    sort_order: index,
  }));

  const { data: newItems, error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsWithInvoiceId)
    .select();

  if (itemsError) {
    console.error('Error creating invoice items:', itemsError);
    throw new Error(itemsError.message);
  }

  return { ...updatedInvoice, items: newItems || [], client: null };
}

/**
 * Delete an invoice (items will be cascade deleted)
 */
export async function deleteInvoice(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw new Error(error.message);
  }

  return true;
}

/**
 * Generate next invoice number for a profile
 */
export async function generateInvoiceNumber(profileId: string): Promise<string> {
  const year = new Date().getFullYear();
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('profile_id', profileId)
    .like('invoice_number', `${year}%`)
    .order('invoice_number', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error generating invoice number:', error);
    return `${year}0001`;
  }

  if (!data || data.length === 0) {
    return `${year}0001`;
  }

  const lastNumber = data[0].invoice_number;
  const match = lastNumber.match(/(\d{4})(\d+)/);

  if (!match) {
    return `${year}0001`;
  }

  const lastYear = match[1];
  const lastSeq = parseInt(match[2], 10);

  if (lastYear === year.toString()) {
    const nextSeq = lastSeq + 1;
    return `${year}${nextSeq.toString().padStart(4, '0')}`;
  } else {
    return `${year}0001`;
  }
}
