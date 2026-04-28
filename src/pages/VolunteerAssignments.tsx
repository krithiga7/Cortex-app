import { useState, useEffect } from "react";
import { VolunteerSidebar } from "@/components/layout/VolunteerSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/store/auth";
import { useCortex } from "@/store/cortex";
import { getVolunteer, getVolunteerByEmail } from "@/services/volunteerService";
import { VolunteerDocument } from "@/types/firestore";
import { CheckCircle, XCircle, Clock, MapPin, Target, MessageSquare, Upload } from "lucide-react";
import { toast } from "sonner";

export default function VolunteerAssignments() {
  const { user } = useAuth();
  const { assignments, requests, updateAssignmentStatus } = useCortex();
  const [volunteerData, setVolunteerData] = useState<VolunteerDocument | null>(null);

  // Load volunteer profile
  useEffect(() => {
    const loadVolunteer = async () => {
      try {
        let data = null;
        if (user?.volunteerId) {
          const { getVolunteer } = await import("@/services/volunteerService");
          data = await getVolunteer(user.volunteerId);
        }
        if (!data && user?.email) {
          const { getVolunteerByEmail } = await import("@/services/volunteerService");
          data = await getVolunteerByEmail(user.email);
        }
        setVolunteerData(data);
      } catch (error) {
        console.error('Failed to load volunteer:', error);
      }
    };
    loadVolunteer();
  }, [user?.volunteerId, user?.email]);

  // Get my assignments
  const volunteerId = user?.volunteerId;
  const myAssignments = assignments.filter(a => a.volunteerId === volunteerId);
  const myRequests = requests.filter(r => myAssignments.some(a => a.requestId === r.id));

  const handleAccept = (assignmentId: string) => {
    updateAssignmentStatus(assignmentId, "Accepted");
    toast.success("Task accepted! 🎯", {
      description: "Please start the task as soon as possible"
    });
  };

  const handleReject = (assignmentId: string) => {
    updateAssignmentStatus(assignmentId, "Rejected");
    toast.info("Task rejected", {
      description: "Admin will assign this to another volunteer"
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <VolunteerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="My Assignments" subtitle="Accept or reject assigned tasks" />
        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 overflow-x-hidden">
          {myRequests.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
              <p className="text-gray-600">Tasks assigned to you will appear here. Stay available!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myRequests.map((request) => {
                const assignment = myAssignments.find(a => a.requestId === request.id);
                return (
                  <div key={request.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-gray-500">{request.id}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            request.priority === "High" ? "bg-red-100 text-red-700" :
                            request.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {request.priority} Priority
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{request.type}</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        assignment?.status === "Pending" ? "bg-orange-100 text-orange-700" :
                        assignment?.status === "Accepted" ? "bg-blue-100 text-blue-700" :
                        assignment?.status === "Rejected" ? "bg-red-100 text-red-700" :
                        assignment?.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {assignment?.status || "Pending"}
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
                      {assignment?.matchScore && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Match Score: {assignment.matchScore}%</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {assignment?.status === "Pending" && (
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button 
                          className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                          onClick={() => handleAccept(assignment.id)}
                        >
                          <CheckCircle className="h-5 w-5" />
                          Accept Task
                        </button>
                        <button 
                          className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                          onClick={() => handleReject(assignment.id)}
                        >
                          <XCircle className="h-5 w-5" />
                          Reject
                        </button>
                      </div>
                    )}

                    {assignment?.status === "Accepted" && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                          <Clock className="h-4 w-4" />
                          <span>Task accepted. Please proceed to the location.</span>
                        </div>
                      </div>
                    )}

                    {assignment?.status === "In Progress" && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                          <Clock className="h-4 w-4" />
                          <span>Task in progress. Upload proof when completed.</span>
                        </div>
                      </div>
                    )}

                    {assignment?.status === "Completed" && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                          <CheckCircle className="h-4 w-4" />
                          <span>Task completed! Great work! 🎉</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
