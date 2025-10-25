'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Button } from '@/components/ui';
import { Spinner } from '@/components/ui';
import { useToast } from '@/components/ui';
import { getProfile, createProfile, updateProfile } from '@/lib/api';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  company_id: z.string().optional(),
  tax_id: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function IndividualProfilePage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const locale = params.locale as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      country: 'Slovakia',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const mockUserId = 'mock-user-id';
      const data = await getProfile(mockUserId, 'individual');

      if (data) {
        setProfile(data);
        reset({
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postal_code: data.postal_code || '',
          country: data.country || 'Slovakia',
          company_id: data.company_id || '',
          tax_id: data.tax_id || '',
          bank_name: data.bank_name || '',
          bank_account: data.bank_account || '',
          iban: data.iban || '',
          swift: data.swift || '',
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: ProfileFormData) {
    try {
      setSaving(true);

      if (profile) {
        await updateProfile(profile.id, data);
        showToast('Profile updated successfully', 'success');
      } else {
        const mockUserId = 'mock-user-id';
        await createProfile({
          ...data,
          user_id: mockUserId,
          profile_type: 'individual',
        });
        showToast('Profile created successfully', 'success');
        await loadProfile();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout profileType="individual" locale={locale}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('nav.individualProfile')}
          </h1>
          <p className="text-gray-600 mt-2">
            Configure your personal information for invoices
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
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
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('profile.companyId')}
                    {...register('company_id')}
                    error={errors.company_id?.message}
                    helperText="IČO (for self-employed)"
                  />

                  <Input
                    label={t('profile.taxId')}
                    {...register('tax_id')}
                    error={errors.tax_id?.message}
                    helperText="DIČ"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Banking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Bank Name"
                    {...register('bank_name')}
                    error={errors.bank_name?.message}
                  />

                  <Input
                    label={t('profile.bankAccount')}
                    {...register('bank_account')}
                    error={errors.bank_account?.message}
                  />

                  <Input
                    label={t('profile.iban')}
                    {...register('iban')}
                    error={errors.iban?.message}
                  />

                  <Input
                    label={t('profile.swift')}
                    {...register('swift')}
                    error={errors.swift?.message}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  label="Notes"
                  {...register('notes')}
                  error={errors.notes?.message}
                  rows={4}
                />
              </CardContent>
            </Card>

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
                {t('common.save')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
