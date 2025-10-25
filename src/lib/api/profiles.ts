import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Get profile by user ID and profile type
 */
export async function getProfile(userId: string, profileType: 'company' | 'individual'): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('profile_type', profileType)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Get profile by ID
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Create a new profile
 */
export async function createProfile(profile: ProfileInsert): Promise<Profile | null> {
  const response = await fetch('/api/profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Error creating profile:', result.error);
    throw new Error(result.error || 'Failed to create profile');
  }

  return result.data;
}

/**
 * Update an existing profile
 */
export async function updateProfile(id: string, updates: ProfileUpdate): Promise<Profile | null> {
  const response = await fetch(`/api/profiles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Error updating profile:', result.error);
    throw new Error(result.error || 'Failed to update profile');
  }

  return result.data;
}

/**
 * Delete a profile
 */
export async function deleteProfile(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting profile:', error);
    throw new Error(error.message);
  }

  return true;
}
