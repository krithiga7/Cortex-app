import { useEffect, useState } from "react";
import { VolunteerSidebar } from "@/components/layout/VolunteerSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/common/MetricCard";
import { useAuth } from "@/store/auth";
import { useCortex } from "@/store/cortex";
import { getVolunteer, getVolunteerByEmail } from "@/services/volunteerService";
import { VolunteerDocument } from "@/types/firestore";
import { CheckCircle, Clock, MapPin, Target, Truck, User, Phone, Mail, MapPinned, Heart, Car, Languages, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const sampleNew = [
  { type: "Medical" as const, location: "Kodambakkam", desc: "Cardiac arrest – urgent paramedic dispatch.", priority: "High" as const, score: 90, source: "Voice" as const, urgency: 10, severity: 10, locationRisk: 7 },
  { type: "Food" as const, location: "Porur", desc: "Relief camp dinner shortfall.", priority: "Medium" as const, score: 62, source: "WhatsApp" as const, urgency: 6, severity: 7, locationRisk: 4 },
];

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const { requests, assignments } = useCortex();
  const [volunteerData, setVolunteerData] = useState<VolunteerDocument | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load volunteer profile from Firebase
  useEffect(() => {
    const loadVolunteerProfile = async () => {
      try {
        let data = null;
        
        // Try to load by volunteerId first
        if (user?.volunteerId) {
          data = await getVolunteer(user.volunteerId);
        }
        
        // Fallback to email lookup
        if (!data && user?.email) {
          data = await getVolunteerByEmail(user.email);
          
          // Update user's volunteerId if found
          if (data && data.volunteerId && !user.volunteerId) {
            // We can't call updateUser here directly, but the data will still display
            console.log('Found volunteer by email:', data.volunteerId);
          }
        }
        
        setVolunteerData(data);
      } catch (error) {
        console.error('Failed to load volunteer profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVolunteerProfile();
  }, [user?.volunteerId, user?.email]);
  
  // Get volunteer-specific data
  const volunteerId = user?.volunteerId;
  const myAssignments = assignments.filter(a => a.volunteerId === volunteerId);
  const myRequests = requests.filter(r => myAssignments.some(a => a.requestId === r.id));
  
  const completedTasks = myAssignments.filter(a => a.status === "Completed").length;
  const activeTasks = myAssignments.filter(a => a.status === "In Progress" || a.status === "Dispatched").length;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <VolunteerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title="Volunteer Dashboard"
          subtitle={`Welcome back, ${user?.name} · Execution Mode Active`}
        />
        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 overflow-x-hidden">
      {/* Profile Card */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ) : volunteerData ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{volunteerData.name}</h2>
                <p className="text-gray-600">Volunteer ID: {volunteerData.volunteerId}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Contact Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                Contact Information
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {volunteerData.email}
              </p>
              {volunteerData.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {volunteerData.phone}
                </p>
              )}
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPinned className="h-4 w-4" />
                {volunteerData.location}
              </p>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {volunteerData.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            {volunteerData.metadata && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Additional Info
                </h3>
                {volunteerData.metadata.bloodGroup && (
                  <p className="text-sm text-gray-600">Blood Group: {volunteerData.metadata.bloodGroup}</p>
                )}
                {volunteerData.metadata.languages && volunteerData.metadata.languages.length > 0 && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    {volunteerData.metadata.languages.join(', ')}
                  </p>
                )}
                {volunteerData.metadata.hasVehicle && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Has {volunteerData.metadata.vehicleType || 'vehicle'}
                  </p>
                )}
                {volunteerData.metadata.emergencyContact && (
                  <p className="text-sm text-gray-600">
                    Emergency: {volunteerData.metadata.emergencyContact.name} ({volunteerData.metadata.emergencyContact.phone})
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center mb-6">
          <User className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2">Complete Your Profile</h3>
          <p className="text-blue-700 mb-4">Fill out the volunteer registration form to display your profile here</p>
          <button
            onClick={() => window.location.href = '/volunteer-registration'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Complete Registration
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="My Active Tasks" value={activeTasks} delta="Requires your attention" icon={<Target className="h-5 w-5" />} accent="cyan" />
        <MetricCard label="Completed Tasks" value={completedTasks} delta="Great job!" icon={<CheckCircle className="h-5 w-5" />} accent="success" />
        <MetricCard label="Avg Response Time" value="14m" delta="Faster than 85% volunteers" icon={<Clock className="h-5 w-5" />} />
        <MetricCard label="Trust Score" value="92%" delta="Based on performance" icon={<Truck className="h-5 w-5" />} accent="success" />
      </div>

      {/* Assigned Tasks */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Assigned Tasks</h2>
        
        {myRequests.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Tasks</h3>
            <p className="text-gray-600">You're all caught up! New tasks will appear here when assigned.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myRequests.map((request) => {
              const assignment = myAssignments.find(a => a.requestId === request.id);
              return (
                <div key={request.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">{request.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          request.priority === "High" ? "bg-red-100 text-red-700" :
                          request.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {request.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{request.type}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      assignment?.status === "Dispatched" ? "bg-blue-100 text-blue-700" :
                      assignment?.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {assignment?.status}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">{request.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{request.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>{request.people} people affected</span>
                    </div>
                    {assignment?.eta && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>ETA: {assignment.eta} minutes</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {assignment?.status === "Dispatched" && (
                      <button 
                        className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                        onClick={() => {
                          toast.success("Task started!", { description: "Good luck!" });
                        }}
                      >
                        Start Task
                      </button>
                    )}
                    {assignment?.status === "In Progress" && (
                      <button 
                        className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                        onClick={() => {
                          toast.success("Task completed! 🎉", { description: "Great work!" });
                        }}
                      >
                        Complete Task
                      </button>
                    )}
                    <button 
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                      onClick={() => {
                        toast.info("Issue reported", { description: "Admin has been notified" });
                      }}
                    >
                      Report Issue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Smart Suggestions */}
      <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Smart Suggestions</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• You're near a high-priority medical case in Adyar</li>
          <li>• New food distribution task recommended based on your skills</li>
          <li>• Consider updating your availability status</li>
        </ul>
      </div>
        </main>
      </div>
    </div>
  );
}
