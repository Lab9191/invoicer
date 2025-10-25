import type { Database } from '../database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
type ClientUpdate = Partial<ClientInsert>;

/**
 * Get all clients for a profile
 */
export async function getClients(profileId: string): Promise<Client[]> {
  try {
    const response = await fetch(`/api/clients?profileId=${profileId}`, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching clients:', error);
      throw new Error(error.error || 'Failed to fetch clients');
    }

    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

/**
 * Get a single client by ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  try {
    const response = await fetch(`/api/clients/${id}`, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Error fetching client');
      return null;
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
}

/**
 * Create a new client
 */
export async function createClient(client: ClientInsert): Promise<Client> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Error creating client:', result.error);
    throw new Error(result.error || 'Failed to create client');
  }

  return result.data;
}

/**
 * Update an existing client
 */
export async function updateClient(id: string, updates: ClientUpdate): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Error updating client:', result.error);
    throw new Error(result.error || 'Failed to update client');
  }

  return result.data;
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<boolean> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const result = await response.json();
    console.error('Error deleting client:', result.error);
    throw new Error(result.error || 'Failed to delete client');
  }

  return true;
}
