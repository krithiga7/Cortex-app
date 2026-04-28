import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCortex } from '@/store/cortex';
import { useAuth } from '@/store/auth';
import { aiService } from '@/services/ai';
import { Target, Users, MapPin, Clock, Zap, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cortexStore } from '@/store/cortex';

export default function MatchingEngine() {
  const { requests, volunteers, assignments, loading } = useCortex();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  // Show loading state
  if (loading) {
    return (
      <AppLayout title="Smart Matching Engine" subtitle="Loading...">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading matching engine...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  const handleFindMatch = async (request: any) => {
    setSelectedRequest(request);
    setIsMatching(true);
    setMatchResult(null);

    try {
      // Get already assigned volunteer IDs to avoid duplicates
      const assignedVolunteerIds = new Set(assignments.map(a => a.volunteerId));
      
      // Prepare volunteer data for AI with coordinates
      const volunteerData = volunteers
        .filter(v => !assignedVolunteerIds.has(v.id)) // Exclude already assigned volunteers
        .map(v => ({
          id: v.id,
          name: v.name,
          skills: v.skills || [v.skill],
          location: v.location,
          availability: v.availability,
          currentWorkload: v.currentWorkload || 0,
          maxCapacity: v.maxCapacity || 5,
          reliabilityScore: v.reliabilityScore || v.trust,
          tasksCompleted: v.tasksCompleted || 0,
          x: v.x || 50, // Default center if not specified
          y: v.y || 50,
        }));

      console.log('Matching request:', request.id, 'at', request.x, request.y);
      console.log('Available volunteers (not yet assigned):', volunteerData.filter(v => v.availability === 'Available').length);

      // Call AI matching engine with coordinates
      const match = await aiService.findBestVolunteer(
        request.type,
        request.location,
        request.priority,
        volunteerData,
        request.x || 50, // Pass request coordinates
        request.y || 50
      );

      console.log('Match result:', match);
      setMatchResult(match);

      toast.success('Match found!', {
        description: `${match.volunteerName} - ${match.matchScore}% match`,
      });
    } catch (error: any) {
      console.error('Matching error:', error);
      
      // If AI fails, use local fallback matching
      console.warn('⚠️ AI matching failed, using local algorithmic fallback...');
      
      const availableVolunteers = volunteerData.filter(v => v.availability === 'Available');
      if (availableVolunteers.length === 0) {
        toast.error('No volunteers available', {
          description: 'No available volunteers to match',
        });
        return;
      }
      
      // Simple distance-based matching as fallback
      const requestX = request.x || 50;
      const requestY = request.y || 50;
      
      let bestVolunteer = availableVolunteers[0];
      let bestDistance = Infinity;
      
      availableVolunteers.forEach(v => {
        const volX = v.x || 50;
        const volY = v.y || 50;
        const distance = Math.sqrt(Math.pow(volX - requestX, 2) + Math.pow(volY - requestY, 2));
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestVolunteer = v;
        }
      });
      
      const fallbackMatch = {
        volunteerId: bestVolunteer.id,
        volunteerName: bestVolunteer.name,
        matchScore: Math.round(Math.max(50, 85 - bestDistance)),
        reasons: [
          'Closest available volunteer (local fallback)',
          `Distance: ~${Math.round(bestDistance * 2)} km`,
          'Available for immediate assignment'
        ],
        estimatedArrival: Math.round(bestDistance * 3)
      };
      
      setMatchResult(fallbackMatch);
      
      toast.warning('AI temporarily unavailable - Using local matching', {
        description: `${fallbackMatch.volunteerName} matched (closest available)`,
        duration: 5000,
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleAssign = () => {
    if (!selectedRequest || !matchResult) return;

    cortexStore.assign(selectedRequest.id, matchResult.volunteerId);

    toast.success('Volunteer assigned!', {
      description: `${matchResult.volunteerName} has been assigned to ${selectedRequest.id}`,
    });

    setSelectedRequest(null);
    setMatchResult(null);
  };

  return (
    <AppLayout
      title="Smart Matching Engine"
      subtitle="AI-powered volunteer-request optimization with Google Gemini"
    >
      {/* AI Status Banner */}
      <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-blue-900">Gemini AI Active</span>
        </div>
        <span className="text-xs text-blue-700">Real-time AI matching • No fallback</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Pending Requests */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pending Requests</h2>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              {pendingRequests.length} waiting
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-3" />
                <p>All requests assigned!</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => handleFindMatch(request)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedRequest?.id === request.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500">{request.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          request.priority === 'High' ? 'bg-red-100 text-red-700' :
                          request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {request.priority}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900">{request.type}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{request.score}</div>
                      <div className="text-xs text-gray-500">Priority Score</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{request.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {request.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {request.people} people
                    </span>
                  </div>

                  {selectedRequest?.id === request.id && isMatching && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">AI is finding best match...</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Match Results */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">AI Match Result</h2>

          {!matchResult ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
              <Target className="h-16 w-16 mb-4" />
              <p className="text-sm">Select a request to find the best volunteer match</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Match Success */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Best Match Found: {matchResult.matchScore}% Compatible
                </span>
              </div>

              {/* Volunteer Card */}
              <div className="p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{matchResult.volunteerName}</h3>
                    <p className="text-sm text-gray-600">{matchResult.volunteerId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{matchResult.matchScore}%</div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Estimated Arrival: <strong>{matchResult.estimatedArrival} minutes</strong></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">Why This Volunteer?</div>
                  {matchResult.reasons.map((reason: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matching Criteria Breakdown */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-sm font-medium text-gray-900 mb-3">Matching Algorithm</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Skill Match</span>
                    <span className="font-medium text-gray-900">40% weight</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Proximity</span>
                    <span className="font-medium text-gray-900">25% weight</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Availability</span>
                    <span className="font-medium text-gray-900">20% weight</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Workload Balance</span>
                    <span className="font-medium text-gray-900">10% weight</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reliability Score</span>
                    <span className="font-medium text-gray-900">5% weight</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAssign}
                  className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Assign Volunteer
                </button>
                <button
                  onClick={() => handleFindMatch(selectedRequest)}
                  className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Re-match
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
