import { useSyncExternalStore } from "react";
import { NeedRequest, Assignment, RequestStatus, Availability } from "@/data/mock";
import { requestService, volunteerService, assignmentService, authService } from "@/services/api";

// State
let state = {
  requests: [] as NeedRequest[],
  volunteers: [] as any[],
  assignments: [] as Assignment[],
  loading: true,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// Track initialization
let dataInitialized = false;

// Initialize data from Backend API
async function initializeData() {
  if (dataInitialized && state.volunteers.length > 0) {
    state.loading = false;
    emit();
    return;
  }

  // Load from cache first
  try {
    const cached = localStorage.getItem('cortex_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      state.requests = parsed.requests || [];
      state.volunteers = parsed.volunteers || [];
      state.assignments = parsed.assignments || [];
      state.loading = false;
      emit();
    }
  } catch (e) {
    console.warn('Cache load failed:', e);
  }

  try {
    // Load from Backend API
    const [requests, volunteers, assignments] = await Promise.all([
      requestService.getAll(),
      volunteerService.getAll(),
      assignmentService.getAll()
    ]);

    // Transform data (simplified - adjust field names as needed)
    state.requests = requests.map((r: any) => ({
      id: r.request_id || r.id,
      type: r.category || 'Medical',
      people: r.people_affected || 0,
      location: r.location,
      priority: r.urgency || 'Medium',
      score: r.priority_score || 0,
      status: r.status || 'Pending',
      createdAt: 'Just now',
      description: r.description || '',
      x: r.x || 50,
      y: r.y || 50,
    }));

    state.volunteers = volunteers.map((v: any) => ({
      id: v.volunteer_id || v.id,
      name: v.name,
      skill: v.skill || 'General',
      location: v.location,
      availability: v.availability || 'Available',
      trust: v.trust || 85,
      tasksCompleted: v.tasks_completed || 0,
      x: v.x || 50,
      y: v.y || 50,
    }));

    state.assignments = assignments.map((a: any) => ({
      id: a.assignment_id || a.id,
      requestId: a.request_id,
      volunteerId: a.volunteer_id,
      eta: a.eta,
      status: a.status,
      startedAt: 'Just now',
    }));

    state.loading = false;
    dataInitialized = true;
    
    // Cache data
    localStorage.setItem('cortex_cache', JSON.stringify({
      requests: state.requests,
      volunteers: state.volunteers,
      assignments: state.assignments
    }));
    
    emit();
    console.log('✅ Backend data loaded');
  } catch (error) {
    console.error('Backend load failed:', error);
    state.loading = false;
    emit();
  }
}

// Start initialization
initializeData();

export const cortexStore = {
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addRequest: async (r: NeedRequest) => {
    try {
      await createRequest({
        requestId: r.id,
        type: r.type,
        people: r.people,
        location: r.location,
        priority: r.priority,
        score: r.score,
        status: r.status as any,
        description: r.description,
        source: (r.source || 'Form').toLowerCase() as any,
        urgency: r.urgency || 5,
        severity: r.severity || 5,
        locationRisk: r.locationRisk || 5,
        suggestedVolunteer: r.suggestedVolunteer,
        x: r.x,
        y: r.y,
      } as any);
    } catch (error) {
      console.error('Failed to add request:', error);
    }
  },
  updateRequestStatus: async (id: string, status: RequestStatus) => {
    try {
      await updateRequest(id, { status: status.toLowerCase() as any });
    } catch (error) {
      console.error('Failed to update request status:', error);
    }
  },
  toggleVolunteerAvailability: async (id: string) => {
    try {
      const volunteer = state.volunteers.find((v) => v.id === id);
      if (volunteer) {
        const newAvailability = volunteer.availability === "Available" ? "Busy" : "Available";
        await updateVolunteer(id, { availability: newAvailability });
      }
    } catch (error) {
      console.error('Failed to toggle volunteer availability:', error);
    }
  },
  setVolunteerAvailability: async (id: string, a: Availability) => {
    try {
      await updateVolunteer(id, { availability: a });
    } catch (error) {
      console.error('Failed to set volunteer availability:', error);
    }
  },
  assign: async (requestId: string, volunteerId: string) => {
    try {
      const newA: Assignment = {
        id: `A${Math.floor(Math.random() * 9000) + 300}`,
        requestId,
        volunteerId,
        eta: Math.floor(Math.random() * 18) + 6,
        status: "Pending",
        startedAt: new Date().toISOString(),
      };
      
      // Call backend API
      await assignmentService.create({
        assignment_id: newA.id,
        request_id: requestId,
        volunteer_id: volunteerId,
        eta: newA.eta,
        status: newA.status,
        started_at: new Date().toISOString(),
      });

      // Update request status
      await requestService.update(requestId, { status: 'assigned' });
      
      // Update volunteer availability
      await volunteerService.update(volunteerId, { availability: "Busy" });
    } catch (error) {
      console.error('Assignment failed:', error);
    }
  },
  updateAssignmentStatus: async (id: string, status: Assignment["status"]) => {
    try {
      await updateAssignment(id, { status });
    } catch (error) {
      console.error('Failed to update assignment status:', error);
    }
  },
  submitProof: async (assignmentId: string, proofUrl: string, feedback: string) => {
    try {
      await updateAssignment(assignmentId, {
        status: "Completed",
        proofSubmitted: true,
        proofUrl,
        feedback,
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to submit proof:', error);
    }
  },
};

export function useCortex() {
  return useSyncExternalStore(cortexStore.subscribe, cortexStore.getState, cortexStore.getState);
}
