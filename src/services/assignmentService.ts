import { supabase } from '@/supabase/client';

export interface AssignmentData {
  id?: string;
  assignmentId: string;
  requestId: string;
  volunteerId: string;
  eta: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  proofSubmitted?: boolean;
  proofUrl?: string;
  feedback?: string;
  verificationStatus?: string;
  matchScore?: number;
  rating?: number;
}

/**
 * Create a new assignment in Supabase
 */
export async function createAssignment(assignment: Omit<AssignmentData, 'id'>): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        assignment_id: assignment.assignmentId,
        request_id: assignment.requestId,
        volunteer_id: assignment.volunteerId,
        eta: assignment.eta,
        status: assignment.status,
        started_at: assignment.startedAt ? new Date(assignment.startedAt).toISOString() : new Date().toISOString(),
        completed_at: assignment.completedAt ? new Date(assignment.completedAt).toISOString() : null,
        proof_submitted: assignment.proofSubmitted || false,
        proof_url: assignment.proofUrl || null,
        feedback: assignment.feedback || null,
        verification_status: assignment.verificationStatus || 'Pending',
        match_score: assignment.matchScore || 0,
        rating: assignment.rating || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Failed to create assignment:', error);
    throw new Error('Failed to create assignment in Supabase');
  }
}

/**
 * Update an existing assignment
 */
export async function updateAssignment(assignmentId: string, updates: Partial<AssignmentData>): Promise<void> {
  try {
    const { error } = await supabase
      .from('assignments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update assignment:', error);
    throw new Error('Failed to update assignment in Supabase');
  }
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete assignment:', error);
    throw new Error('Failed to delete assignment in Supabase');
  }
}

/**
 * Get a single assignment by ID
 */
export async function getAssignment(assignmentId: string): Promise<AssignmentData | null> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select()
      .eq('id', assignmentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      assignmentId: data.assignment_id,
      requestId: data.request_id,
      volunteerId: data.volunteer_id,
      eta: data.eta,
      status: data.status,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      proofSubmitted: data.proof_submitted,
      proofUrl: data.proof_url,
      feedback: data.feedback,
      verificationStatus: data.verification_status,
      matchScore: data.match_score,
      rating: data.rating
    };
  } catch (error) {
    console.error('Failed to get assignment:', error);
    throw new Error('Failed to get assignment from Supabase');
  }
}

/**
 * Get all assignments
 */
export async function getAssignments(): Promise<AssignmentData[]> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select()
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(doc => ({
      id: doc.id,
      assignmentId: doc.assignment_id,
      requestId: doc.request_id,
      volunteerId: doc.volunteer_id,
      eta: doc.eta,
      status: doc.status,
      startedAt: doc.started_at,
      completedAt: doc.completed_at,
      proofSubmitted: doc.proof_submitted,
      proofUrl: doc.proof_url,
      feedback: doc.feedback,
      verificationStatus: doc.verification_status,
      matchScore: doc.match_score,
      rating: doc.rating
    }));
  } catch (error) {
    console.error('Failed to get assignments:', error);
    throw new Error('Failed to get assignments from Supabase');
  }
}

/**
 * Get assignments by volunteer ID
 */
export async function getAssignmentsByVolunteer(volunteerId: string): Promise<AssignmentData[]> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select()
      .eq('volunteer_id', volunteerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(doc => ({
      id: doc.id,
      assignmentId: doc.assignment_id,
      requestId: doc.request_id,
      volunteerId: doc.volunteer_id,
      eta: doc.eta,
      status: doc.status,
      startedAt: doc.started_at,
      completedAt: doc.completed_at,
      proofSubmitted: doc.proof_submitted,
      proofUrl: doc.proof_url,
      feedback: doc.feedback,
      verificationStatus: doc.verification_status,
      matchScore: doc.match_score,
      rating: doc.rating
    }));
  } catch (error) {
    console.error('Failed to get assignments by volunteer:', error);
    throw new Error('Failed to get assignments by volunteer from Supabase');
  }
}

/**
 * Get assignments by request ID
 */
export async function getAssignmentsByRequest(requestId: string): Promise<AssignmentData[]> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select()
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(doc => ({
      id: doc.id,
      assignmentId: doc.assignment_id,
      requestId: doc.request_id,
      volunteerId: doc.volunteer_id,
      eta: doc.eta,
      status: doc.status,
      startedAt: doc.started_at,
      completedAt: doc.completed_at,
      proofSubmitted: doc.proof_submitted,
      proofUrl: doc.proof_url,
      feedback: doc.feedback,
      verificationStatus: doc.verification_status,
      matchScore: doc.match_score,
      rating: doc.rating
    }));
  } catch (error) {
    console.error('Failed to get assignments by request:', error);
    throw new Error('Failed to get assignments by request from Supabase');
  }
}

/**
 * Subscribe to real-time assignment updates
 */
export function subscribeToAssignments(callback: (assignments: AssignmentData[]) => void): () => void {
  const subscription = supabase
    .channel('assignments_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'assignments'
      },
      async () => {
        const assignments = await getAssignments();
        callback(assignments);
      }
    )
    .subscribe();

  // Initial load
  getAssignments().then(callback);

  return () => {
    subscription.unsubscribe();
  };
}
