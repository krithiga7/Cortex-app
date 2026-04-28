// Firestore Document Types

export interface RequestDocument {
  requestId: string;
  category: 'Medical' | 'Food' | 'Shelter' | 'Water' | 'Clothes' | 'Document';
  urgency: 'High' | 'Medium' | 'Low';
  location: string;
  summary: string;
  peopleAffected: number;
  uploadedFileUrl?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  priorityScore: number;
  createdAt: Date;
  updatedAt: Date;
  source: 'form' | 'whatsapp' | 'voice' | 'ocr' | 'multimodal';
  description: string;
  x?: number;
  y?: number;
}

export interface VolunteerDocument {
  volunteerId: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  location: string;
  availability: 'Available' | 'Busy' | 'Offline';
  rating: number;
  completedTasks: number;
  currentLoad: number;
  maxCapacity: number;
  createdAt: Date;
  updatedAt: Date;
  x?: number;
  y?: number;
  // Additional volunteer profile data
  metadata?: {
    age?: number;
    gender?: string;
    address?: string;
    area?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relation?: string;
    };
    experience?: string;
    availability?: string;
    hoursPerWeek?: number;
    bloodGroup?: string;
    medicalConditions?: string;
    physicallyFit?: boolean;
    hasVehicle?: boolean;
    vehicleType?: string;
    hasFirstAidKit?: boolean;
    hasCommunicationDevice?: boolean;
    languages?: string[];
    previousExperience?: string;
    motivation?: string;
  };
}

export interface AssignmentDocument {
  assignmentId: string;
  requestId: string;
  volunteerId: string;
  matchScore: number;
  assignmentStatus: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'failed';
  assignedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  feedback?: string;
  rating?: number;
}

export interface StorageUploadResult {
  url: string;
  path: string;
  fileName: string;
  size: number;
  contentType: string;
}
