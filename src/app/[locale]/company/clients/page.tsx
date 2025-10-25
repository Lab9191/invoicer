'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
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
  useToast,
} from '@/components/ui';
import { getClients, deleteClient, getProfile } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { Database } from '@/lib/database.types';
import { ClientModal } from './ClientModal';

type Client = Database['public']['Tables']['clients']['Row'];

export default function ClientsPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const locale = params.locale as string;

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProfileAndClients();
  }, []);

  async function loadProfileAndClients() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        showToast('Please log in', 'error');
        router.push(`/${locale}/auth/login`);
        return;
      }
      const profile = await getProfile(user.id, 'company');

      if (profile) {
        setProfileId(profile.id);
        const data = await getClients(profile.id);
        setClients(data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      showToast('Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setSelectedClient(null);
    setIsModalOpen(true);
  }

  function handleEdit(client: Client) {
    setSelectedClient(client);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await deleteClient(id);
      showToast('Client deleted successfully', 'success');
      await loadProfileAndClients();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      showToast('Failed to delete client', 'error');
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setSelectedClient(null);
    loadProfileAndClients();
  }

  return (
    <DashboardLayout profileType="company" locale={locale}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('nav.clients')}
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your clients and their information
            </p>
          </div>
          <Button onClick={handleCreate} disabled={!profileId}>
            {t('common.create')} Client
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : clients.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No clients yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first client to start generating invoices
                </p>
                <Button onClick={handleCreate} disabled={!profileId}>
                  {t('common.create')} Client
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Clients ({clients.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Phone</TableHeader>
                    <TableHeader>City</TableHeader>
                    <TableHeader>Country</TableHeader>
                    <TableHeader align="right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          {client.company_id && (
                            <div className="text-xs text-gray-500">
                              ID: {client.company_id}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>{client.city || '-'}</TableCell>
                      <TableCell>{client.country || '-'}</TableCell>
                      <TableCell align="right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(client)}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant={deleteConfirm === client.id ? 'danger' : 'ghost'}
                            onClick={() => handleDelete(client.id)}
                          >
                            {deleteConfirm === client.id ? 'Confirm?' : t('common.delete')}
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

        {isModalOpen && profileId && (
          <ClientModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            profileId={profileId}
            client={selectedClient}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
