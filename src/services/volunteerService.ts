import { supabase } from '@/supabase/client';
import { VolunteerDocument } from '@/types/firestore';

/**
 * Create a new volunteer
 */
export async function createVolunteer(volunteer: Omit<VolunteerDocument, 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    console.log('📝 Creating volunteer in Supabase:', volunteer.volunteerId);
    console.log('Volunteer data:', JSON.stringify(volunteer, null, 2));
    
    const volunteerData = {
      volunteer_id: volunteer.volunteerId,
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone || '',
      skills: volunteer.skills || [],
      location: volunteer.location,
      availability: volunteer.availability,
      rating: volunteer.rating || 0,
      completed_tasks: volunteer.completedTasks || 0,
      current_load: volunteer.currentLoad || 0,
      max_capacity: volunteer.maxCapacity || 5,
      x: volunteer.x || 50,
      y: volunteer.y || 50,
      metadata: volunteer.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Sending to Supabase:', JSON.stringify(volunteerData, null, 2));
    
    const { data, error } = await supabase
      .from('volunteers')
      .insert(volunteerData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log('✅ Volunteer created successfully:', data.id);
    return data.id;
  } catch (error: any) {
    console.error('Failed to create volunteer:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Update a volunteer
 */
export async function updateVolunteer(volunteerId: string, updates: Partial<VolunteerDocument>): Promise<void> {
  try {
    const { error } = await supabase
      .from('volunteers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('volunteer_id', volunteerId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update volunteer:', error);
    throw new Error('Failed to update volunteer');
  }
}

/**
 * Delete a volunteer
 */
export async function deleteVolunteer(volunteerId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('volunteer_id', volunteerId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete volunteer:', error);
    throw new Error('Failed to delete volunteer');
  }
}

/**
 * Get a volunteer by ID
 */
export async function getVolunteer(volunteerId: string): Promise<VolunteerDocument | null> {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('volunteer_id', volunteerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      volunteerId: data.volunteer_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      skills: data.skills,
      location: data.location,
      availability: data.availability,
      rating: data.rating,
      completedTasks: data.completed_tasks,
      currentLoad: data.current_load,
      maxCapacity: data.max_capacity,
      x: data.x,
      y: data.y,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as VolunteerDocument;
  } catch (error) {
    console.error('Failed to get volunteer:', error);
    throw new Error('Failed to get volunteer from Supabase');
  }
}

/**
 * Get all volunteers
 */
export async function getVolunteers(): Promise<VolunteerDocument[]> {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map((item: any) => ({
      volunteerId: item.volunteer_id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      skills: item.skills,
      location: item.location,
      availability: item.availability,
      rating: item.rating,
      completedTasks: item.completed_tasks,
      currentLoad: item.current_load,
      maxCapacity: item.max_capacity,
      x: item.x,
      y: item.y,
      metadata: item.metadata,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    })) as VolunteerDocument[];
  } catch (error) {
    console.error('Failed to get volunteers:', error);
    throw new Error('Failed to get volunteers');
  }
}

/**
 * Subscribe to real-time volunteer updates
 */
export function subscribeToVolunteers(callback: (volunteers: VolunteerDocument[]) => void): () => void {
  const subscription = supabase
    .channel('volunteers_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'volunteers'
      },
      async () => {
        // Refetch all volunteers on change
        const volunteers = await getVolunteers();
        callback(volunteers);
      }
    )
    .subscribe();

  // Initial fetch
  getVolunteers().then(callback);

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Get available volunteers
 */
export async function getAvailableVolunteers(): Promise<VolunteerDocument[]> {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('availability', 'Available');

    if (error) throw error;

    return data.map((item: any) => ({
      volunteerId: item.volunteer_id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      skills: item.skills,
      location: item.location,
      availability: item.availability,
      rating: item.rating,
      completedTasks: item.completed_tasks,
      currentLoad: item.current_load,
      maxCapacity: item.max_capacity,
      x: item.x,
      y: item.y,
      metadata: item.metadata,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    })) as VolunteerDocument[];
  } catch (error) {
    console.error('Failed to get available volunteers:', error);
    throw new Error('Failed to get available volunteers');
  }
}

/**
 * Get volunteers by skill
 */
export async function getVolunteersBySkill(skill: string): Promise<VolunteerDocument[]> {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .contains('skills', [skill]);

    if (error) throw error;

    return data.map((item: any) => ({
      volunteerId: item.volunteer_id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      skills: item.skills,
      location: item.location,
      availability: item.availability,
      rating: item.rating,
      completedTasks: item.completed_tasks,
      currentLoad: item.current_load,
      maxCapacity: item.max_capacity,
      x: item.x,
      y: item.y,
      metadata: item.metadata,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    })) as VolunteerDocument[];
  } catch (error) {
    console.error('Failed to get volunteers by skill:', error);
    throw new Error('Failed to get volunteers by skill');
  }
}

/**
 * Get volunteer by email
 */
export async function getVolunteerByEmail(email: string): Promise<VolunteerDocument | null> {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      volunteerId: data.volunteer_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      skills: data.skills,
      location: data.location,
      availability: data.availability,
      rating: data.rating,
      completedTasks: data.completed_tasks,
      currentLoad: data.current_load,
      maxCapacity: data.max_capacity,
      x: data.x,
      y: data.y,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as VolunteerDocument;
  } catch (error) {
    console.error('Failed to get volunteer by email:', error);
    throw new Error('Failed to get volunteer by email from Supabase');
  }
}

/**
 * Update volunteer availability
 */
export async function updateVolunteerAvailability(
  volunteerId: string, 
  availability: 'Available' | 'Busy' | 'Offline'
): Promise<void> {
  return updateVolunteer(volunteerId, { availability });
}

/**
 * Increment completed tasks
 */
export async function incrementCompletedTasks(volunteerId: string): Promise<void> {
  try {
    const volunteer = await getVolunteer(volunteerId);
    if (volunteer) {
      await updateVolunteer(volunteerId, {
        completedTasks: volunteer.completedTasks + 1,
        currentLoad: Math.max(0, volunteer.currentLoad - 1)
      });
    }
  } catch (error) {
    console.error('Failed to increment completed tasks:', error);
    throw new Error('Failed to increment completed tasks');
  }
}
