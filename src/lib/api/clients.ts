import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

/**
 * Get all clients for a profile
 */
export async function getClients(profileId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('profile_id', profileId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get a single client by ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }

  return data;
}

/**
 * Create a new client
 */
export async function createClient(client: ClientInsert): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update an existing client
 */
export async function updateClient(id: string, updates: ClientUpdate): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    throw new Error(error.message);
  }

  return true;
}
