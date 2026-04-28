import { NeedRequest } from "@/data/mock";
import { AlertTriangle, Users, Clock, MapPin, TrendingUp } from "lucide-react";

export function PriorityScoreCard({ request }: { request: NeedRequest }) {
  const urgency = request.urgency || 0;
  const severity = request.severity || 0;
  const timeDecay = request.timeDecay || 0;
  const locationRisk = request.locationRisk || 0;
  const score = request.score || 0;

  const factors = [
    { name: "Urgency", value: urgency, max: 10, icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-500" },
    { name: "Severity", value: severity, max: 10, icon: Users, color: "text-orange-600", bgColor: "bg-orange-500" },
    { name: "Time Decay", value: Math.min(timeDecay / 6, 10), max: 10, icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-500" },
    { name: "Location Risk", value: locationRisk, max: 10, icon: MapPin, color: "text-purple-600", bgColor: "bg-purple-500" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-gray-900">Priority Intelligence Engine</h3>
          <p className="text-xs text-gray-600 mt-0.5">AI-powered scoring for request {request.id}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{score}</div>
          <div className="text-xs text-gray-600">Priority Score</div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {factors.map((factor) => {
          const Icon = factor.icon;
          const percentage = (factor.value / factor.max) * 100;
          return (
            <div key={factor.name} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${factor.color}`} />
                  <span className="text-sm font-medium text-gray-900">{factor.name}</span>
                </div>
                <span className={`text-sm font-bold ${factor.color}`}>
                  {factor.value.toFixed(1)}/{factor.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${factor.bgColor} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-blue-900 mb-1">How Score is Calculated</div>
            <div className="text-xs text-blue-700 leading-relaxed">
              Weighted algorithm: Urgency (35%) + Severity (30%) + Time Decay (20%) + Location Risk (15%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
