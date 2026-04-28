export type Priority = "High" | "Medium" | "Low";
export type RequestType = "Medical" | "Food" | "Shelter" | "Clothes" | "Water";
export type RequestStatus = "Pending" | "Assigned" | "In Progress" | "Resolved";
export type Availability = "Available" | "Busy" | "Offline";
export type IngestionSource = "Form" | "WhatsApp" | "Voice" | "OCR" | "Manual";

export interface NeedRequest {
  id: string;
  type: RequestType;
  people: number;
  location: string;
  priority: Priority;
  score: number;
  status: RequestStatus;
  createdAt: string;
  description: string;
  suggestedVolunteer?: string;
  // map coords (relative 0-100 grid)
  x: number;
  y: number;
  // New fields for enhanced features
  source?: IngestionSource;
  urgency?: number; // 1-10
  severity?: number; // 1-10
  timeDecay?: number; // minutes since creation
  locationRisk?: number; // 1-10
  volunteerSkills?: string[];
  estimatedTravelTime?: number; // minutes
  workload?: number; // current tasks assigned
}

export interface Volunteer {
  id: string;
  name: string;
  skill: string;
  location: string;
  availability: Availability;
  trust: number;
  tasksCompleted: number;
  avgResponse: number; // minutes
  // New fields for volunteer graph
  skills?: string[];
  transportationCapability?: boolean;
  reliabilityScore?: number; // 1-100
  currentWorkload?: number;
  maxCapacity?: number;
  x?: number; // Map coordinates
  y?: number;
}

export interface Assignment {
  id: string;
  requestId: string;
  volunteerId: string;
  eta: number;
  status: "Pending" | "Accepted" | "Rejected" | "Dispatched" | "In Progress" | "Completed";
  startedAt: string;
  // New fields for execution tracking
  completedAt?: string;
  proofSubmitted?: boolean;
  proofUrl?: string;
  feedback?: string;
  verificationStatus?: "Pending" | "Verified" | "Failed";
  matchScore?: number;
  rating?: number;
}

export const initialRequests: NeedRequest[] = [
  {
    id: "R101", type: "Medical", people: 15, location: "T Nagar",
    priority: "High", score: 95, status: "Pending",
    createdAt: "2 min ago",
    description: "Multiple injured after building collapse. Urgent first-aid and ambulance support needed.",
    suggestedVolunteer: "V101", x: 38, y: 42,
    source: "Form", urgency: 10, severity: 9, timeDecay: 2, locationRisk: 8,
    volunteerSkills: ["Medical", "First Aid", "Emergency Care"], estimatedTravelTime: 14, workload: 2,
  },
  {
    id: "R102", type: "Food", people: 50, location: "Velachery",
    priority: "High", score: 88, status: "Pending",
    createdAt: "5 min ago",
    description: "Flood-affected families in relief camp need urgent food and water supplies.",
    suggestedVolunteer: "V102", x: 62, y: 70,
    source: "WhatsApp", urgency: 9, severity: 7, timeDecay: 5, locationRisk: 7,
    volunteerSkills: ["Food Distribution", "Logistics"], estimatedTravelTime: 22, workload: 3,
  },
  {
    id: "R103", type: "Shelter", people: 30, location: "Tambaram",
    priority: "Medium", score: 75, status: "Pending",
    createdAt: "10 min ago",
    description: "Homeless families need temporary shelter and blankets due to heavy rains.",
    suggestedVolunteer: "V104", x: 45, y: 80,
    source: "Voice", urgency: 7, severity: 8, timeDecay: 10, locationRisk: 6,
    volunteerSkills: ["Shelter Coord.", "Community Management"], estimatedTravelTime: 28, workload: 1,
  },
  {
    id: "R104", type: "Medical", people: 8, location: "Adyar",
    priority: "High", score: 92, status: "Pending",
    createdAt: "3 min ago",
    description: "Elderly residents in care facility need medical checkup and medication.",
    suggestedVolunteer: "V108", x: 70, y: 55,
    source: "Form", urgency: 9, severity: 8, timeDecay: 3, locationRisk: 5,
    volunteerSkills: ["Medical", "First Aid", "Elderly Care"], estimatedTravelTime: 12, workload: 1,
  },
  {
    id: "R105", type: "Water", people: 100, location: "Anna Nagar",
    priority: "High", score: 90, status: "Pending",
    createdAt: "7 min ago",
    description: "Water pipeline burst affecting entire neighborhood. Need urgent water tankers.",
    suggestedVolunteer: "V106", x: 25, y: 20,
    source: "WhatsApp", urgency: 10, severity: 6, timeDecay: 7, locationRisk: 4,
    volunteerSkills: ["Water Distribution", "Logistics", "Transport"], estimatedTravelTime: 18, workload: 2,
  },
  {
    id: "R106", type: "Clothes", people: 40, location: "Mylapore",
    priority: "Medium", score: 65, status: "Pending",
    createdAt: "15 min ago",
    description: "Flood victims need dry clothes and blankets urgently.",
    suggestedVolunteer: "V103", x: 55, y: 48,
    source: "Form", urgency: 6, severity: 7, timeDecay: 15, locationRisk: 6,
    volunteerSkills: ["Clothes Distribution", "Community Outreach"], estimatedTravelTime: 16, workload: 2,
  },
  {
    id: "R107", type: "Medical", people: 5, location: "Guindy",
    priority: "Medium", score: 78, status: "Pending",
    createdAt: "12 min ago",
    description: "Industrial accident - workers with minor injuries need first aid.",
    suggestedVolunteer: "V101", x: 42, y: 58,
    source: "Voice", urgency: 7, severity: 6, timeDecay: 12, locationRisk: 7,
    volunteerSkills: ["Medical", "First Aid"], estimatedTravelTime: 15, workload: 2,
  },
  {
    id: "R108", type: "Food", people: 75, location: "Royapuram",
    priority: "High", score: 85, status: "Pending",
    createdAt: "6 min ago",
    description: "Coastal fishing community stranded without food for 2 days.",
    suggestedVolunteer: "V105", x: 68, y: 25,
    source: "WhatsApp", urgency: 8, severity: 8, timeDecay: 6, locationRisk: 9,
    volunteerSkills: ["Food Distribution", "Logistics", "Transport"], estimatedTravelTime: 25, workload: 2,
  },
  {
    id: "R109", type: "Shelter", people: 20, location: "Besant Nagar",
    priority: "Low", score: 55, status: "Pending",
    createdAt: "20 min ago",
    description: "Beach erosion affecting homes. Families need temporary relocation.",
    suggestedVolunteer: "V104", x: 72, y: 65,
    source: "Form", urgency: 5, severity: 6, timeDecay: 20, locationRisk: 5,
    volunteerSkills: ["Shelter Coord.", "Transport"], estimatedTravelTime: 20, workload: 1,
  },
  {
    id: "R110", type: "Water", people: 60, location: "Saidapet",
    priority: "Medium", score: 72, status: "Pending",
    createdAt: "9 min ago",
    description: "Contaminated water supply reported. Need clean drinking water distribution.",
    suggestedVolunteer: "V107", x: 48, y: 52,
    source: "Voice", urgency: 8, severity: 7, timeDecay: 9, locationRisk: 6,
    volunteerSkills: ["Water Distribution", "Transport"], estimatedTravelTime: 17, workload: 0,
  },
];

export const initialVolunteers: Volunteer[] = [
  { id: "V101", name: "Arjun Krishnan", skill: "Medical", location: "Adyar", availability: "Available", trust: 92, tasksCompleted: 148, avgResponse: 14, skills: ["Medical", "First Aid", "Emergency Care"], transportationCapability: true, reliabilityScore: 95, currentWorkload: 2, maxCapacity: 5, x: 70, y: 55 },
  { id: "V102", name: "Meena Sundaram", skill: "Food Distribution", location: "T Nagar", availability: "Available", trust: 85, tasksCompleted: 96, avgResponse: 22, skills: ["Food Distribution", "Logistics", "Community Outreach"], transportationCapability: true, reliabilityScore: 88, currentWorkload: 3, maxCapacity: 6, x: 38, y: 42 },
  { id: "V103", name: "Rahul Verma", skill: "Medical", location: "Saidapet", availability: "Available", trust: 88, tasksCompleted: 120, avgResponse: 16, skills: ["Medical", "First Aid", "Emergency Care"], transportationCapability: true, reliabilityScore: 91, currentWorkload: 2, maxCapacity: 5, x: 48, y: 52 },
  { id: "V104", name: "Priya Raman", skill: "Shelter Coord.", location: "Tambaram", availability: "Available", trust: 79, tasksCompleted: 64, avgResponse: 28, skills: ["Shelter Coord.", "Community Management", "Transport"], transportationCapability: true, reliabilityScore: 82, currentWorkload: 1, maxCapacity: 4, x: 45, y: 80 },
  { id: "V105", name: "Karthik Iyer", skill: "Logistics", location: "Adyar", availability: "Available", trust: 81, tasksCompleted: 88, avgResponse: 19, skills: ["Logistics", "Transport", "Food Distribution"], transportationCapability: true, reliabilityScore: 85, currentWorkload: 2, maxCapacity: 5, x: 68, y: 58 },
  { id: "V106", name: "Lakshmi Devi", skill: "Food Distribution", location: "Anna Nagar", availability: "Available", trust: 90, tasksCompleted: 132, avgResponse: 17, skills: ["Food Distribution", "Water Distribution", "Community Outreach"], transportationCapability: true, reliabilityScore: 93, currentWorkload: 2, maxCapacity: 5, x: 25, y: 20 },
  { id: "V107", name: "Suresh Babu", skill: "Driver", location: "Velachery", availability: "Available", trust: 74, tasksCompleted: 52, avgResponse: 31, skills: ["Transport", "Driving", "Water Distribution"], transportationCapability: true, reliabilityScore: 76, currentWorkload: 0, maxCapacity: 4, x: 62, y: 70 },
  { id: "V108", name: "Anitha Joseph", skill: "Medical", location: "Mylapore", availability: "Available", trust: 95, tasksCompleted: 210, avgResponse: 12, skills: ["Medical", "First Aid", "Emergency Care", "Elderly Care"], transportationCapability: true, reliabilityScore: 97, currentWorkload: 1, maxCapacity: 6, x: 55, y: 48 },
  { id: "V109", name: "Vikram Singh", skill: "Clothes Distribution", location: "Guindy", availability: "Available", trust: 83, tasksCompleted: 75, avgResponse: 20, skills: ["Clothes Distribution", "Community Outreach", "Logistics"], transportationCapability: true, reliabilityScore: 86, currentWorkload: 1, maxCapacity: 5, x: 42, y: 58 },
  { id: "V110", name: "Deepa Nair", skill: "Water Distribution", location: "Royapuram", availability: "Available", trust: 87, tasksCompleted: 105, avgResponse: 18, skills: ["Water Distribution", "Logistics", "Food Distribution"], transportationCapability: true, reliabilityScore: 89, currentWorkload: 2, maxCapacity: 5, x: 68, y: 25 },
];

export const initialAssignments: Assignment[] = [
  { id: "A201", requestId: "R102", volunteerId: "V102", eta: 14, status: "Dispatched", startedAt: "8 min ago", completedAt: undefined, proofSubmitted: false, verificationStatus: "Pending" },
  { id: "A202", requestId: "R104", volunteerId: "V103", eta: 6, status: "In Progress", startedAt: "12 min ago", completedAt: undefined, proofSubmitted: false, verificationStatus: "Pending" },
];

export const autoDecisions = [
  { id: "D1", text: "Assigned: Medical case R108 → Volunteer V101 (Arjun)", time: "now", kind: "assign" as const },
  { id: "D2", text: "Predicted demand spike → Saidapet (next 2 hrs)", time: "1 min ago", kind: "predict" as const },
  { id: "D3", text: "Re-routed V104 from low-priority R103 to higher score", time: "3 min ago", kind: "reroute" as const },
  { id: "D4", text: "Trust score recalculated for 8 volunteers", time: "6 min ago", kind: "system" as const },
];

export const incomingFeed = [
  "Food Required – 25 people – Velachery",
  "Medical Emergency – 12 people – T Nagar",
  "Shelter – 8 people – Tambaram",
  "Water – 60 people – Adyar",
  "Medical – 2 people – Guindy",
];
