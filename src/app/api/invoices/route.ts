import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/invoices?profileId=xxx&status=xxx&fromDate=xxx&toDate=xxx
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  const status = searchParams.get('status');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  if (!profileId) {
    return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    .eq('profile_id', profileId);

  if (status) {
    query = query.eq('status', status);
  }

  if (fromDate) {
    query = query.gte('invoice_date', fromDate);
  }

  if (toDate) {
    query = query.lte('invoice_date', toDate);
  }

  query = query.order('invoice_number', { ascending: false });

  const { data: invoices, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Fetch items for each invoice
  const invoiceIds = invoices?.map(inv => inv.id) || [];

  if (invoiceIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('*')
    .in('invoice_id', invoiceIds);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 });
  }

  // Combine invoices with their items
  const invoicesWithItems = invoices?.map(invoice => ({
    ...invoice,
    items: items?.filter(item => item.invoice_id === invoice.id) || [],
  })) || [];

  return NextResponse.json({ data: invoicesWithItems });
}

// POST /api/invoices - Create invoice with items
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const body = await request.json();
  const { items, ...invoiceData } = body;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single();

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 400 });
  }

  // Create invoice items
  if (items && items.length > 0) {
    const itemsToInsert = items.map((item: any) => ({
      ...item,
      invoice_id: invoice.id,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback: delete the invoice
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }
  }

  // Fetch the complete invoice with items
  const { data: completeInvoice } = await supabase
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
    .eq('id', invoice.id)
    .single();

  const { data: invoiceItems } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoice.id);

  return NextResponse.json({
    data: {
      ...completeInvoice,
      items: invoiceItems || [],
    },
  });
}
