'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUp } from '@/lib/auth';
import { Input, Button, useToast } from '@/components/ui';
import { PasswordStrength } from '@/components/ui/password-strength';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password', '');

  async function onSubmit(data: SignupFormData) {
    try {
      setIsLoading(true);
      await signUp(data.email, data.password);
      // Auto-confirm enabled - redirect directly to login
      showToast('Account created successfully! Please sign in.', 'success');
      router.push(`/${locale}/auth/login`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Signup failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="text-4xl font-bold text-purple-600">
            📄 Invoicer
          </Link>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
              required
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
                required
                autoComplete="new-password"
              />
              <PasswordStrength password={password} />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              required
              autoComplete="new-password"
            />

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600">
                By creating an account, you agree to our{' '}
                <Link href="#" className="text-purple-600 hover:text-purple-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-purple-600 hover:text-purple-700">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href={`/${locale}/auth/login`}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Security Features */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-xs text-gray-700">Instant account activation</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-xs text-gray-700">Encrypted data storage</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-xs text-gray-700">Row-level security enabled</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-xs text-gray-700">Auto-logout after 10min inactivity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
