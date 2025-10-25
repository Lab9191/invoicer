'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  Spinner,
  Select,
  Input,
  useToast,
} from '@/components/ui';
import { getInvoices, deleteInvoice, getProfile } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { InvoiceWithItems } from '@/lib/api/invoices';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function InvoicesPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const locale = params.locale as string;

  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadProfileAndInvoices();
  }, [statusFilter, fromDate, toDate]);

  async function loadProfileAndInvoices() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        showToast('Please log in', 'error');
        router.push(`/${locale}/auth/login`);
        return;
      }
      const profile = await getProfile(user.id, 'individual');

      if (profile) {
        setProfileId(profile.id);
        const data = await getInvoices(profile.id, {
          status: statusFilter || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      showToast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await deleteInvoice(id);
      showToast('Invoice deleted successfully', 'success');
      await loadProfileAndInvoices();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showToast('Failed to delete invoice', 'error');
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

  return (
    <DashboardLayout profileType="individual" locale={locale}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('nav.invoices')}
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track your invoices
            </p>
          </div>
          <Link href={`/${locale}/company/invoices/new`}>
            <Button disabled={!profileId}>
              {t('common.create')} Invoice
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Status"
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              <Input
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <Input
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStatusFilter('');
                    setFromDate('');
                    setToDate('');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No invoices yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first invoice to get started
                </p>
                <Link href={`/${locale}/company/invoices/new`}>
                  <Button disabled={!profileId}>
                    {t('common.create')} Invoice
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Invoices ({invoices.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Invoice #</TableHeader>
                    <TableHeader>Client</TableHeader>
                    <TableHeader>Issue Date</TableHeader>
                    <TableHeader>Due Date</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader align="right">Amount</TableHeader>
                    <TableHeader align="right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link
                          href={`/${locale}/company/invoices/${invoice.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {invoice.client?.name || 'No client'}
                      </TableCell>
                      <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                      <TableCell>{formatDate(invoice.due_date)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status || 'draft']}`}>
                          {invoice.status || 'draft'}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="font-medium">
                          {formatCurrency(invoice.total_amount)}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/${locale}/company/invoices/${invoice.id}`}>
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                          </Link>
                          <Link href={`/${locale}/company/invoices/${invoice.id}/edit`}>
                            <Button size="sm" variant="ghost">
                              {t('common.edit')}
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant={deleteConfirm === invoice.id ? 'danger' : 'ghost'}
                            onClick={() => handleDelete(invoice.id)}
                          >
                            {deleteConfirm === invoice.id ? 'Confirm?' : t('common.delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
