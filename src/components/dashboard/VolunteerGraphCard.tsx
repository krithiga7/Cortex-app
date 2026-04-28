import { Volunteer } from "@/data/mock";
import { User, MapPin, Star, CheckCircle, Clock, Truck } from "lucide-react";

export function VolunteerGraphCard({ volunteer }: { volunteer: Volunteer }) {
  const skills = volunteer.skills || [volunteer.skill];
  const reliability = volunteer.reliabilityScore || volunteer.trust;
  const workload = volunteer.currentWorkload || 0;
  const maxCapacity = volunteer.maxCapacity || 5;
  const utilizationPercent = (workload / maxCapacity) * 100;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 grid place-items-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{volunteer.name}</div>
            <div className="text-xs text-gray-600">{volunteer.id}</div>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            volunteer.availability === "Available"
              ? "bg-green-100 text-green-700"
              : volunteer.availability === "Busy"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {volunteer.availability}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <MapPin className="h-3 w-3 text-gray-500" />
          <span>{volunteer.location}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-700">
          <Star className="h-3 w-3 text-yellow-500" />
          <span>Reliability: {reliability}%</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-700">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>{volunteer.tasksCompleted} tasks completed</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-700">
          <Clock className="h-3 w-3 text-blue-500" />
          <span>Avg response: {volunteer.avgResponse} min</span>
        </div>

        {volunteer.transportationCapability && (
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <Truck className="h-3 w-3 text-purple-500" />
            <span>Has transportation</span>
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-1">Skills</div>
        <div className="flex flex-wrap gap-1">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-700 font-medium">Workload</span>
          <span className="text-gray-900 font-bold">{workload}/{maxCapacity}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              utilizationPercent > 80
                ? "bg-red-500"
                : utilizationPercent > 60
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${utilizationPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
