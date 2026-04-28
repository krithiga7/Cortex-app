import { supabase } from '@/supabase/client';
import { RequestDocument } from '@/types/firestore';

const REQUESTS_TABLE = 'requests';

/**
 * Create a new request in Supabase
 */
export async function createRequest(request: Omit<RequestDocument, 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const { data, error } = await supabase
      .from(REQUESTS_TABLE)
      .insert({
        request_id: request.requestId || `REQ-${Date.now()}`,
        category: request.category || request.type || 'Medical',
        people_affected: request.peopleAffected || request.people || 0,
        location: request.location || '',
        urgency: request.urgency || 'Medium',
        priority_score: request.priorityScore || request.score || 0,
        status: request.status || 'pending',
        description: request.description || '',
        source: request.source || 'form',
        summary: request.summary || request.description?.substring(0, 100) || '',
        x: request.x || 50,
        y: request.y || 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Failed to create request:', error);
    throw new Error('Failed to create request in Supabase');
  }
}

/**
 * Update an existing request
 */
export async function updateRequest(requestId: string, updates: Partial<RequestDocument>): Promise<void> {
  try {
    const { error } = await supabase
      .from(REQUESTS_TABLE)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update request:', error);
    throw new Error('Failed to update request in Supabase');
  }
}

/**
 * Delete a request
 */
export async function deleteRequest(requestId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(REQUESTS_TABLE)
      .delete()
      .eq('id', requestId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete request:', error);
    throw new Error('Failed to delete request in Supabase');
  }
}

/**
 * Get a single request by ID
 */
export async function getRequest(requestId: string): Promise<RequestDocument | null> {
  try {
    const { data, error } = await supabase
      .from(REQUESTS_TABLE)
      .select()
      .eq('id', requestId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      id: data.id,
      requestId: data.request_id,
      category: data.category,
      urgency: data.urgency,
      location: data.location,
      summary: data.summary,
      peopleAffected: data.people_affected,
      status: data.status,
      priorityScore: data.priority_score,
      source: data.source,
      description: data.description,
      x: data.x,
      y: data.y,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as RequestDocument;
  } catch (error) {
    console.error('Failed to get request:', error);
    throw new Error('Failed to get request from Supabase');
  }
}

/**
 * Get all requests with optional filtering
 */
export async function getRequests(filters?: {
  status?: string;
  urgency?: string;
  category?: string;
}): Promise<RequestDocument[]> {
  try {
    let query = supabase
      .from(REQUESTS_TABLE)
      .select()
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.urgency) {
      query = query.eq('urgency', filters.urgency);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(doc => ({
      id: doc.id,
      requestId: doc.request_id,
      category: doc.category,
      urgency: doc.urgency,
      location: doc.location,
      summary: doc.summary,
      peopleAffected: doc.people_affected,
      status: doc.status,
      priorityScore: doc.priority_score,
      source: doc.source,
      description: doc.description,
      x: doc.x,
      y: doc.y,
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at)
    })) as RequestDocument[];
  } catch (error) {
    console.error('Failed to get requests:', error);
    throw new Error('Failed to get requests from Supabase');
  }
}

/**
 * Subscribe to real-time request updates
 */
export function subscribeToRequests(
  callback: (requests: RequestDocument[]) => void,
  filters?: { status?: string; urgency?: string; category?: string }
): () => void {
  const subscription = supabase
    .channel('requests_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: REQUESTS_TABLE
      },
      async () => {
        const requests = await getRequests(filters);
        callback(requests);
      }
    )
    .subscribe();

  // Initial load
  getRequests(filters).then(callback);

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Get requests by location
 */
export async function getRequestsByLocation(location: string): Promise<RequestDocument[]> {
  try {
    const { data, error } = await supabase
      .from(REQUESTS_TABLE)
      .select()
      .eq('location', location)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(doc => ({
      id: doc.id,
      requestId: doc.request_id,
      category: doc.category,
      urgency: doc.urgency,
      location: doc.location,
      summary: doc.summary,
      peopleAffected: doc.people_affected,
      status: doc.status,
      priorityScore: doc.priority_score,
      source: doc.source,
      description: doc.description,
      x: doc.x,
      y: doc.y,
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at)
    })) as RequestDocument[];
  } catch (error) {
    console.error('Failed to get requests by location:', error);
    throw new Error('Failed to get requests by location from Supabase');
  }
}

/**
 * Get pending requests
 */
export async function getPendingRequests(): Promise<RequestDocument[]> {
  return getRequests({ status: 'pending' });
}
