'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Modal, Input, Textarea, Button, useToast } from '@/components/ui';
import { createClient, updateClient } from '@/lib/api';
import type { Database } from '@/lib/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string().nullable(),
  company_id: z.string().nullable(),
  tax_id: z.string().nullable(),
  vat_id: z.string().nullable(),
  notes: z.string().nullable(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  client: Client | null;
}

export function ClientModal({ isOpen, onClose, profileId, client }: ClientModalProps) {
  const t = useTranslations();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        postal_code: client.postal_code || '',
        country: client.country || '',
        company_id: client.company_id || '',
        tax_id: client.tax_id || '',
        vat_id: client.vat_id || '',
        notes: client.notes || '',
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'Slovakia',
        company_id: '',
        tax_id: '',
        vat_id: '',
        notes: '',
      });
    }
  }, [client, reset]);

  async function onSubmit(data: ClientFormData) {
    try {
      if (client) {
        await updateClient(client.id, data);
        showToast('Client updated successfully', 'success');
      } else {
        await createClient({
          ...data,
          profile_id: profileId,
        });
        showToast('Client created successfully', 'success');
      }
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      showToast('Failed to save client', 'error');
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Edit Client' : 'Create Client'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label={t('profile.name')}
              {...register('name')}
              error={errors.name?.message}
              required
            />
          </div>

          <Input
            label={t('profile.email')}
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label={t('profile.phone')}
            {...register('phone')}
            error={errors.phone?.message}
          />

          <div className="md:col-span-2">
            <Input
              label={t('profile.address')}
              {...register('address')}
              error={errors.address?.message}
            />
          </div>

          <Input
            label={t('profile.city')}
            {...register('city')}
            error={errors.city?.message}
          />

          <Input
            label={t('profile.postalCode')}
            {...register('postal_code')}
            error={errors.postal_code?.message}
          />

          <div className="md:col-span-2">
            <Input
              label={t('profile.country')}
              {...register('country')}
              error={errors.country?.message}
            />
          </div>

          <Input
            label={t('profile.companyId')}
            {...register('company_id')}
            error={errors.company_id?.message}
            helperText="IČO"
          />

          <Input
            label={t('profile.taxId')}
            {...register('tax_id')}
            error={errors.tax_id?.message}
            helperText="DIČ"
          />

          <div className="md:col-span-2">
            <Input
              label={t('profile.vatId')}
              {...register('vat_id')}
              error={errors.vat_id?.message}
              helperText="IČ DPH"
            />
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Notes"
              {...register('notes')}
              error={errors.notes?.message}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
