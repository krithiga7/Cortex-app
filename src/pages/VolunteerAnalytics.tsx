import { useState, useEffect } from "react";
import { VolunteerSidebar } from "@/components/layout/VolunteerSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/store/auth";
import { useCortex } from "@/store/cortex";
import { MetricCard } from "@/components/common/MetricCard";
import { CheckCircle, Clock, Star, TrendingUp, Award, Target, BarChart3 } from "lucide-react";

export default function VolunteerAnalytics() {
  const { user } = useAuth();
  const { assignments, requests } = useCortex();

  const volunteerId = user?.volunteerId;
  const myAssignments = assignments.filter(a => a.volunteerId === volunteerId);
  
  const totalTasks = myAssignments.length;
  const completedTasks = myAssignments.filter(a => a.status === "Completed").length;
  const acceptedTasks = myAssignments.filter(a => a.status === "Accepted" || a.status === "In Progress" || a.status === "Dispatched").length;
  const rejectedTasks = myAssignments.filter(a => a.status === "Rejected").length;
  const pendingTasks = myAssignments.filter(a => a.status === "Pending").length;

  // Calculate performance metrics
  const acceptanceRate = totalTasks > 0 ? ((totalTasks - rejectedTasks) / totalTasks * 100).toFixed(1) : "0";
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : "0";
  
  // Calculate average rating from completed tasks
  const completedWithRating = myAssignments.filter(a => a.status === "Completed" && a.rating);
  const avgRating = completedWithRating.length > 0
    ? (completedWithRating.reduce((sum, a) => sum + (a.rating || 0), 0) / completedWithRating.length).toFixed(1)
    : "0";

  // Calculate performance score (0-100)
  const performanceScore = Math.round(
    (parseFloat(acceptanceRate) * 0.3 + 
     parseFloat(completionRate) * 0.4 + 
     (parseFloat(avgRating) / 5 * 100) * 0.3)
  );

  // Get performance tier
  const getPerformanceTier = (score: number) => {
    if (score >= 90) return { tier: "Elite", color: "text-purple-600", bg: "bg-purple-100" };
    if (score >= 75) return { tier: "Advanced", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 60) return { tier: "Intermediate", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 40) return { tier: "Beginner", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { tier: "New Volunteer", color: "text-gray-600", bg: "bg-gray-100" };
  };

  const tier = getPerformanceTier(performanceScore);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <VolunteerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="My Performance" subtitle="Track your volunteer metrics and achievements" />
        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 overflow-x-hidden">
          {/* Performance Score Card */}
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Score</h2>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-5xl font-bold ${tier.color}`}>{performanceScore}</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${tier.bg} ${tier.color}`}>
                    {tier.tier}
                  </span>
                </div>
                <p className="text-gray-600">Based on acceptance rate, completion rate, and ratings</p>
              </div>
              <Award className="h-24 w-24 text-blue-600 opacity-20" />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard 
              label="Acceptance Rate" 
              value={`${acceptanceRate}%`} 
              delta={`${totalTasks - rejectedTasks}/${totalTasks} tasks accepted`}
              icon={<Target className="h-5 w-5" />} 
              accent="cyan" 
            />
            <MetricCard 
              label="Completion Rate" 
              value={`${completionRate}%`} 
              delta={`${completedTasks}/${totalTasks} tasks completed`}
              icon={<CheckCircle className="h-5 w-5" />} 
              accent="success" 
            />
            <MetricCard 
              label="Average Rating" 
              value={`${avgRating}/5`} 
              delta={`${completedWithRating.length} rated tasks`}
              icon={<Star className="h-5 w-5" />} 
              accent="success" 
            />
            <MetricCard 
              label="Response Time" 
              value="14m" 
              delta="Faster than 85% volunteers"
              icon={<Clock className="h-5 w-5" />} 
              accent="cyan" 
            />
          </div>

          {/* Task Breakdown */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Task Status Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-semibold text-green-600">{completedTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${totalTasks > 0 ? (completedTasks/totalTasks)*100 : 0}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-semibold text-yellow-600">{acceptedTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${totalTasks > 0 ? (acceptedTasks/totalTasks)*100 : 0}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-semibold text-orange-600">{pendingTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${totalTasks > 0 ? (pendingTasks/totalTasks)*100 : 0}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <span className="text-sm font-semibold text-red-600">{rejectedTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${totalTasks > 0 ? (rejectedTasks/totalTasks)*100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance Insights
              </h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-900 font-medium">Strengths</p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>• High acceptance rate shows commitment</li>
                    <li>• Consistent task completion</li>
                    <li>• Quick response time</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50">
                  <p className="text-sm text-yellow-900 font-medium">Areas to Improve</p>
                  <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                    <li>• Upload proof for all completed tasks</li>
                    <li>• Provide feedback after each task</li>
                    <li>• Maintain availability during peak hours</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <p className="text-sm text-green-900 font-medium">Next Milestone</p>
                  <p className="text-xs text-green-700 mt-1">
                    Complete {Math.ceil((totalTasks + 1) / 10) * 10 - totalTasks} more tasks to reach next tier!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Badges & Achievements */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Achievements & Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg border-2 text-center ${
                completedTasks >= 5 ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-gray-50 opacity-50"
              }`}>
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-xs font-semibold">First 5 Tasks</p>
                <p className="text-[10px] text-gray-600">Complete 5 tasks</p>
              </div>
              <div className={`p-4 rounded-lg border-2 text-center ${
                parseFloat(acceptanceRate) >= 90 ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 opacity-50"
              }`}>
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-semibold">90% Acceptance</p>
                <p className="text-[10px] text-gray-600">Maintain 90%+ rate</p>
              </div>
              <div className={`p-4 rounded-lg border-2 text-center ${
                parseFloat(avgRating) >= 4.5 ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-gray-50 opacity-50"
              }`}>
                <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-xs font-semibold">Top Rated</p>
                <p className="text-[10px] text-gray-600">4.5+ avg rating</p>
              </div>
              <div className={`p-4 rounded-lg border-2 text-center ${
                completedTasks >= 20 ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 opacity-50"
              }`}>
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-xs font-semibold">20 Tasks Done</p>
                <p className="text-[10px] text-gray-600">Complete 20 tasks</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
