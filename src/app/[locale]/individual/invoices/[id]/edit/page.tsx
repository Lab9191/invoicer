'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Input, Textarea, Select, Button, Spinner, useToast } from '@/components/ui';
import { getClients, getInvoiceById, updateInvoice } from '@/lib/api';
import type { Database } from '@/lib/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.number().min(0, 'Price must be non-negative'),
});

const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  delivery_date: z.string().optional().default(''),
  due_date: z.string().min(1, 'Due date is required'),
  language: z.enum(['en', 'sk']),
  payment_method: z.string().min(1, 'Payment method is required'),
  payment_reference: z.string().optional().default(''),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional().default(''),
  include_qr_code: z.boolean().optional().default(true),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function EditInvoicePage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const locale = params.locale as string;
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  useEffect(() => {
    loadData();
  }, [invoiceId]);

  async function loadData() {
    try {
      setLoading(true);
      const invoice = await getInvoiceById(invoiceId);

      if (!invoice) {
        showToast('Invoice not found', 'error');
        router.back();
        return;
      }

      const clientsData = await getClients(invoice.profile_id);
      setClients(clientsData);

      reset({
        client_id: invoice.client_id || '',
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        delivery_date: invoice.delivery_date || '',
        due_date: invoice.due_date,
        language: (invoice.language as 'en' | 'sk') || 'en',
        payment_method: invoice.payment_method || 'Wire transfer',
        payment_reference: invoice.payment_reference || '',
        status: invoice.status || 'draft',
        notes: invoice.notes || '',
        include_qr_code: invoice.include_qr_code !== false,
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'hours',
          unit_price: item.unit_price,
        })),
      });
    } catch (error) {
      console.error('Error loading invoice:', error);
      showToast('Failed to load invoice', 'error');
    } finally {
      setLoading(false);
    }
  }

  function calculateItemTotal(item: typeof watchItems[0]): number {
    return item.quantity * item.unit_price;
  }

  function calculateSubtotal(): number {
    return watchItems?.reduce((sum, item) => sum + calculateItemTotal(item), 0) || 0;
  }

  async function onSubmit(data: InvoiceFormData) {
    try {
      setSaving(true);

      const subtotal = calculateSubtotal();
      const items = data.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total_price: calculateItemTotal(item),
      }));

      await updateInvoice(
        invoiceId,
        {
          client_id: data.client_id,
          invoice_number: data.invoice_number,
          issue_date: data.issue_date,
          delivery_date: data.delivery_date || null,
          due_date: data.due_date,
          language: data.language,
          payment_method: data.payment_method,
          payment_reference: data.payment_reference || null,
          status: data.status,
          notes: data.notes || null,
          include_qr_code: data.include_qr_code,
          subtotal,
          vat_amount: 0,
          total_amount: subtotal,
        },
        items
      );

      showToast('Invoice updated successfully', 'success');
      router.push(`/${locale}/company/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      showToast('Failed to update invoice', 'error');
    } finally {
      setSaving(false);
    }
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

  return (
    <DashboardLayout profileType="individual" locale={locale}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Invoice
          </h1>
          <p className="text-gray-600 mt-2">
            Update invoice details and items
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Client"
                  {...register('client_id')}
                  options={clients.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Select a client"
                  error={errors.client_id?.message}
                  required
                />

                <Input
                  label={t('invoice.number')}
                  {...register('invoice_number')}
                  error={errors.invoice_number?.message}
                  required
                />

                <Input
                  label={t('invoice.issueDate')}
                  type="date"
                  {...register('issue_date')}
                  error={errors.issue_date?.message}
                  required
                />

                <Input
                  label={t('invoice.deliveryDate')}
                  type="date"
                  {...register('delivery_date')}
                  error={errors.delivery_date?.message}
                />

                <Input
                  label={t('invoice.dueDate')}
                  type="date"
                  {...register('due_date')}
                  error={errors.due_date?.message}
                  required
                />

                <Select
                  label="Language"
                  {...register('language')}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'sk', label: 'Slovak' },
                  ]}
                  required
                />

                <Input
                  label="Payment Method"
                  {...register('payment_method')}
                  error={errors.payment_method?.message}
                />

                <Input
                  label="Payment Reference"
                  {...register('payment_reference')}
                  error={errors.payment_reference?.message}
                  helperText="Variable symbol"
                />

                <Select
                  label="Status"
                  {...register('status')}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'sent', label: 'Sent' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'overdue', label: 'Overdue' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                  required
                />

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="include_qr_code"
                    {...register('include_qr_code')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="include_qr_code" className="ml-2 text-sm text-gray-700">
                    Include QR Code
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t('invoice.items')}</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => append({ description: '', quantity: 1, unit: 'hours', unit_price: 0 })}
                >
                  {t('invoice.addItem')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <Input
                          label={t('invoice.description')}
                          {...register(`items.${index}.description`)}
                          error={errors.items?.[index]?.description?.message}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label={t('invoice.quantity')}
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          error={errors.items?.[index]?.quantity?.message}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label={t('invoice.unit')}
                          {...register(`items.${index}.unit`)}
                          error={errors.items?.[index]?.unit?.message}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label={t('invoice.unitPrice')}
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                          error={errors.items?.[index]?.unit_price?.message}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        Total: {watchItems && watchItems[index] ? calculateItemTotal(watchItems[index]).toFixed(2) : '0.00'} €
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Subtotal</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {calculateSubtotal().toFixed(2)} €
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                label="Notes"
                {...register('notes')}
                error={errors.notes?.message}
                rows={4}
                helperText="Optional notes to include on the invoice"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={saving}
            >
              Update Invoice
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
