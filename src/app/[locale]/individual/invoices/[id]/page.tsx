'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner, useToast } from '@/components/ui';
import { getInvoiceById, getProfileById } from '@/lib/api';
import { generateInvoicePDF, downloadPDF, type InvoiceData } from '@/lib/pdf-generator';
import type { InvoiceWithItems } from '@/lib/api/invoices';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function InvoiceViewPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const locale = params.locale as string;
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  async function loadInvoice() {
    try {
      setLoading(true);
      const invoiceData = await getInvoiceById(invoiceId);

      if (invoiceData) {
        setInvoice(invoiceData);
        const profileData = await getProfileById(invoiceData.profile_id);
        setProfile(profileData);
      } else {
        showToast('Invoice not found', 'error');
        router.back();
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      showToast('Failed to load invoice', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getPdfData(): InvoiceData | null {
    if (!invoice || !profile) return null;

    return {
        supplier: {
          name: profile.name,
          address: profile.address || '',
          city: profile.city || '',
          postalCode: profile.postal_code || '',
          country: profile.country || '',
          companyId: profile.company_id || undefined,
          taxId: profile.tax_id || undefined,
          vatId: profile.vat_id || undefined,
          registrationInfo: profile.registration_info || undefined,
          phone: profile.phone || undefined,
          email: profile.email || undefined,
          logoUrl: profile.logo_url || undefined,
        },
        client: {
          name: invoice.client?.name || '',
          address: invoice.client?.address || '',
          city: invoice.client?.city || '',
          postalCode: invoice.client?.postal_code || '',
          country: invoice.client?.country || '',
          companyId: invoice.client?.company_id || undefined,
          taxId: invoice.client?.tax_id || undefined,
          vatId: invoice.client?.vat_id || undefined,
        },
        bank: {
          name: profile.bank_name || undefined,
          account: profile.bank_account || undefined,
          iban: profile.iban || '',
          swift: profile.swift || undefined,
        },
        invoiceNumber: invoice.invoice_number,
        issueDate: new Date(invoice.issue_date).toLocaleDateString('sk-SK'),
        deliveryDate: invoice.delivery_date ? new Date(invoice.delivery_date).toLocaleDateString('sk-SK') : undefined,
        dueDate: new Date(invoice.due_date).toLocaleDateString('sk-SK'),
        paymentMethod: invoice.payment_method || 'Wire transfer',
        paymentReference: invoice.payment_reference || invoice.invoice_number,
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'hours',
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })),
        subtotal: invoice.subtotal || undefined,
        vatAmount: invoice.vat_amount || undefined,
        totalAmount: invoice.total_amount,
        notes: invoice.notes || undefined,
        language: (invoice.language as 'en' | 'sk') || 'en',
        includeQrCode: invoice.include_qr_code !== false,
        isVatPayer: profile.is_vat_payer || false,
      };
  }

  async function handleExportPDF() {
    const pdfData = getPdfData();
    if (!pdfData || !invoice) return;

    try {
      setExporting(true);
      const pdfBlob = await generateInvoicePDF(pdfData);
      downloadPDF(pdfBlob, `invoice-${invoice.invoice_number}.pdf`);
      showToast('PDF exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast('Failed to export PDF', 'error');
    } finally {
      setExporting(false);
    }
  }

  async function handlePreviewPDF() {
    const pdfData = getPdfData();
    if (!pdfData) return;

    try {
      setPreviewing(true);
      const pdfBlob = await generateInvoicePDF(pdfData);
      const url = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(url);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      showToast('Failed to preview PDF', 'error');
    } finally {
      setPreviewing(false);
    }
  }

  function closePreview() {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('sk-SK');
  }

  if (loading) {
    return (
      <DashboardLayout profileType="individual" locale={locale}>
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return null;
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <DashboardLayout profileType="individual" locale={locale}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Invoice {invoice.invoice_number}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status || 'draft']}`}>
                {invoice.status || 'draft'}
              </span>
              <span className="text-gray-600">
                {formatDate(invoice.issue_date)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handlePreviewPDF}
              isLoading={previewing}
            >
              Preview PDF
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportPDF}
              isLoading={exporting}
            >
              {t('common.export')}
            </Button>
            <Link href={`/${locale}/individual/invoices/${invoice.id}/edit`}>
              <Button variant="secondary">
                {t('common.edit')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Supplier & Client */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{profile?.name}</div>
                {profile?.address && <div>{profile.address}</div>}
                {profile?.city && (
                  <div>
                    {profile.postal_code} {profile.city}
                  </div>
                )}
                {profile?.country && <div>{profile.country}</div>}
                {profile?.company_id && <div className="mt-2">ID: {profile.company_id}</div>}
                {profile?.tax_id && <div>Tax ID: {profile.tax_id}</div>}
                {profile?.vat_id && <div>VAT ID: {profile.vat_id}</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{invoice.client?.name || 'No client'}</div>
                {invoice.client?.address && <div>{invoice.client.address}</div>}
                {invoice.client?.city && (
                  <div>
                    {invoice.client.postal_code} {invoice.client.city}
                  </div>
                )}
                {invoice.client?.country && <div>{invoice.client.country}</div>}
                {invoice.client?.company_id && <div className="mt-2">ID: {invoice.client.company_id}</div>}
                {invoice.client?.tax_id && <div>Tax ID: {invoice.client.tax_id}</div>}
                {invoice.client?.vat_id && <div>VAT ID: {invoice.client.vat_id}</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Invoice Number</div>
                <div className="font-medium">{invoice.invoice_number}</div>
              </div>
              <div>
                <div className="text-gray-600">Issue Date</div>
                <div className="font-medium">{formatDate(invoice.issue_date)}</div>
              </div>
              {invoice.delivery_date && (
                <div>
                  <div className="text-gray-600">Delivery Date</div>
                  <div className="font-medium">{formatDate(invoice.delivery_date)}</div>
                </div>
              )}
              <div>
                <div className="text-gray-600">Due Date</div>
                <div className="font-medium">{formatDate(invoice.due_date)}</div>
              </div>
              <div>
                <div className="text-gray-600">Payment Method</div>
                <div className="font-medium">{invoice.payment_method}</div>
              </div>
              {invoice.payment_reference && (
                <div>
                  <div className="text-gray-600">Payment Reference</div>
                  <div className="font-medium">{invoice.payment_reference}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm">{item.description}</td>
                      <td className="px-6 py-4 text-sm text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-right">{item.unit}</td>
                      <td className="px-6 py-4 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex justify-end">
                <div className="w-64">
                  {invoice.subtotal && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                  )}
                  {invoice.vat_amount && invoice.vat_amount > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">VAT:</span>
                      <span>{formatCurrency(invoice.vat_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* PDF Preview Modal */}
        {pdfPreviewUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closePreview}
          >
            <div
              className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">PDF Preview</h2>
                <button
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
