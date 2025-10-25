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
  try {
    const params = new URLSearchParams({ profileId });

    if (filters?.status) params.append('status', filters.status);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);

    const response = await fetch(`/api/invoices?${params.toString()}`, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching invoices:', error);
      throw new Error(error.error || 'Failed to fetch invoices');
    }

    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

/**
 * Get a single invoice by ID
 */
export async function getInvoiceById(id: string): Promise<InvoiceWithItems | null> {
  try {
    const response = await fetch(`/api/invoices/${id}`, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Error fetching invoice');
      return null;
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }
}

/**
 * Create a new invoice with items
 */
export async function createInvoice(
  invoice: InvoiceInsert,
  items: InvoiceItemInsert[]
): Promise<InvoiceWithItems> {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...invoice, items }),
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Error creating invoice:', result.error);
    throw new Error(result.error || 'Failed to create invoice');
  }

  return result.data;
}

/**
 * Update an existing invoice with items
 */
export async function updateInvoice(
  id: string,
  updates: InvoiceUpdate,
  items?: InvoiceItemInsert[]
): Promise<InvoiceWithItems> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...updates, items }),
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Error updating invoice:', result.error);
    throw new Error(result.error || 'Failed to update invoice');
  }

  return result.data;
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(id: string): Promise<boolean> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const result = await response.json();
    console.error('Error deleting invoice:', result.error);
    throw new Error(result.error || 'Failed to delete invoice');
  }

  return true;
}

/**
 * Get next invoice number for a profile
 */
export async function getNextInvoiceNumber(profileId: string): Promise<string> {
  try {
    const invoices = await getInvoices(profileId);

    if (invoices.length === 0) {
      return '1';
    }

    // Find highest invoice number
    const numbers = invoices
      .map(inv => parseInt(inv.invoice_number))
      .filter(num => !isNaN(num));

    if (numbers.length === 0) {
      return '1';
    }

    const maxNumber = Math.max(...numbers);
    return String(maxNumber + 1);
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    return '1';
  }
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(items: InvoiceItem[], vatRate: number = 0): {
  subtotal: number;
  vat: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  const vat = vatRate > 0 ? subtotal * (vatRate / 100) : 0;

  const total = subtotal + vat;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Format invoice number with prefix
 */
export function formatInvoiceNumber(
  number: string | number,
  prefix: string = 'INV'
): string {
  const numStr = String(number).padStart(4, '0');
  return `${prefix}-${numStr}`;
}

/**
 * Get invoice status color
 */
export function getInvoiceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'gray',
    sent: 'blue',
    paid: 'green',
    overdue: 'red',
    cancelled: 'gray',
  };
  return colors[status] || 'gray';
}

/**
 * Get invoice status label
 */
export function getInvoiceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}
