import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/common/MetricCard";
import { PriorityFeed } from "@/components/dashboard/PriorityFeed";
import { ChennaiMapView } from "@/components/dashboard/ChennaiMapView";
import { AutoDecisionsPanel } from "@/components/dashboard/AutoDecisionsPanel";
import { DataIngestionPanel } from "@/components/dashboard/DataIngestionPanel";
import { PriorityScoreCard } from "@/components/dashboard/PriorityScoreCard";
import { VolunteerGraphCard } from "@/components/dashboard/VolunteerGraphCard";
import { cortexStore, useCortex } from "@/store/cortex";
import { Activity, AlertTriangle, Clock, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subscribeToRequests } from "@/services/requestService";
import { subscribeToVolunteers } from "@/services/volunteerService";
import { RequestDocument, VolunteerDocument } from "@/types/firestore";

const sampleNew = [
  { type: "Medical" as const, location: "Kodambakkam", desc: "Cardiac arrest – urgent paramedic dispatch.", priority: "High" as const, score: 90, source: "Voice" as const, urgency: 10, severity: 10, locationRisk: 7 },
  { type: "Food" as const, location: "Porur", desc: "Relief camp dinner shortfall.", priority: "Medium" as const, score: 62, source: "WhatsApp" as const, urgency: 6, severity: 7, locationRisk: 4 },
  { type: "Water" as const, location: "Royapuram", desc: "Drinking water tankers requested.", priority: "Medium" as const, score: 58, source: "Form" as const, urgency: 7, severity: 5, locationRisk: 5 },
];

export default function Dashboard() {
  const { requests, volunteers, loading } = useCortex();
  const [selectedRequest, setSelectedRequest] = useState<NeedRequest | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Set initial selected request when data loads
  useEffect(() => {
    if (requests.length > 0 && !selectedRequest) {
      setSelectedRequest(requests[0]);
    }
  }, [requests]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading crisis data...</p>
        </div>
      </div>
    );
  }

  // Firebase Real-time Listeners
  useEffect(() => {
    // Subscribe to requests
    const unsubscribeRequests = subscribeToRequests((firestoreRequests) => {
      console.log('Firebase requests updated:', firestoreRequests.length);
      setIsFirebaseConnected(true);
      // Convert Firestore docs to app format and sync with cortex
      // This keeps mock data for now but shows Firebase is working
    });

    // Subscribe to volunteers
    const unsubscribeVolunteers = subscribeToVolunteers((firestoreVolunteers) => {
      console.log('Firebase volunteers updated:', firestoreVolunteers.length);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeVolunteers();
    };
  }, []);

  // Simulate live incoming requests every ~12s
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      const seed = sampleNew[i % sampleNew.length];
      const id = `R${200 + Math.floor(Math.random() * 800)}`;
      cortexStore.addRequest({
        id,
        type: seed.type,
        people: Math.floor(Math.random() * 25) + 3,
        location: seed.location,
        priority: seed.priority,
        score: seed.score,
        status: "Pending",
        createdAt: "just now",
        description: seed.desc,
        x: 20 + Math.random() * 65,
        y: 20 + Math.random() * 65,
        source: seed.source,
        urgency: seed.urgency,
        severity: seed.severity,
        timeDecay: 0,
        locationRisk: seed.locationRisk,
      });
      toast(`New ${seed.priority} priority request`, {
        description: `${seed.type} – ${seed.location}`,
      });
      i++;
    }, 12000);
    return () => clearInterval(t);
  }, []);

  // Update selected request when requests change
  useEffect(() => {
    if (requests.length > 0 && !selectedRequest) {
      setSelectedRequest(requests[0]);
    }
  }, [requests, selectedRequest]);

  const total = requests.length;
  const high = requests.filter((r) => r.priority === "High" && r.status !== "Resolved").length;
  const active = volunteers.filter((v) => v.availability !== "Offline").length;
  const avgScore = requests.length > 0 ? Math.round(requests.reduce((sum, r) => sum + r.score, 0) / requests.length) : 0;

  return (
    <AppLayout
      title="Mission Control"
      subtitle="Autonomous Crisis Response Engine · AI-Powered Decision Making"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active Requests" value={total} delta="+12 in last hour" icon={<Activity className="h-5 w-5" />} accent="cyan" />
        <MetricCard label="High Priority" value={high} delta="Requires immediate dispatch" icon={<AlertTriangle className="h-5 w-5" />} accent="alert" />
        <MetricCard label="Volunteers Active" value={active} delta={`of ${volunteers.length} on roster`} icon={<Users className="h-5 w-5" />} accent="success" />
        <MetricCard label="Avg Priority Score" value={avgScore} delta="AI-calculated in real-time" icon={<Zap className="h-5 w-5" />} />
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="intelligence" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Priority Engine</TabsTrigger>
          <TabsTrigger value="volunteers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Volunteer Graph</TabsTrigger>
          <TabsTrigger value="ingestion" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Data Collection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ChennaiMapView requests={requests} volunteers={volunteers} />
              <AutoDecisionsPanel />
            </div>
            <div className="space-y-6">
              <PriorityFeed requests={requests} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {requests.slice(0, 4).map((request) => (
              <PriorityScoreCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="volunteers" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {volunteers.map((volunteer) => (
              <VolunteerGraphCard key={volunteer.id} volunteer={volunteer} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ingestion" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <DataIngestionPanel />
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-display font-semibold text-gray-900 mb-4">Offline-First Architecture</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-sm font-medium text-green-900 mb-1">✓ Offline Data Collection</div>
                  <div className="text-xs text-green-700">Works without internet in rural areas</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-sm font-medium text-blue-900 mb-1">✓ Low Bandwidth Mode</div>
                  <div className="text-xs text-blue-700">Optimized for 2G/3G connections</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-sm font-medium text-purple-900 mb-1">✓ Auto Sync</div>
                  <div className="text-xs text-purple-700">Syncs when connectivity returns</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
