import { useState } from "react";
import { VolunteerSidebar } from "@/components/layout/VolunteerSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/store/auth";
import { useCortex, cortexStore } from "@/store/cortex";
import { Upload, CheckCircle, Image, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VolunteerUpload() {
  const { user } = useAuth();
  const { assignments, requests, submitProof } = useCortex();
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const volunteerId = user?.volunteerId;
  const myAssignments = assignments.filter(a => a.volunteerId === volunteerId && a.status === "In Progress");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large", { description: "Maximum file size is 10MB" });
        return;
      }
      setUploadedFile(file);
      toast.success("File selected", { description: file.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssignment) {
      toast.error("Please select a task", { description: "Choose a task to submit proof for" });
      return;
    }

    if (!uploadedFile) {
      toast.error("Please upload proof", { description: "Upload an image or document as proof" });
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please add feedback", { description: "Describe what you accomplished" });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate file upload to Firebase Storage
      // In production, you would upload to Firebase Storage here
      const mockProofUrl = `https://storage.firebase.com/proof/${Date.now()}_${uploadedFile.name}`;
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Submit proof
      cortexStore.submitProof(selectedAssignment, mockProofUrl, feedback);

      toast.success("Proof submitted successfully! 🎉", {
        description: "Your task completion has been recorded"
      });

      // Reset form
      setSelectedAssignment("");
      setFeedback("");
      setUploadedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", { description: "Please try again" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <VolunteerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Upload Proof" subtitle="Submit proof of task completion with feedback" />
        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 overflow-x-hidden">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Task */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Task</h3>
                
                {myAssignments.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No tasks in progress</p>
                    <p className="text-sm text-gray-500 mt-1">Accept a task first, then come back here to upload proof</p>
                  </div>
                ) : (
                  <select
                    value={selectedAssignment}
                    onChange={(e) => setSelectedAssignment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a task...</option>
                    {myAssignments.map(assignment => {
                      const request = requests.find(r => r.id === assignment.requestId);
                      return (
                        <option key={assignment.id} value={assignment.id}>
                          {request?.type} - {request?.location} ({request?.id})
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Upload Proof */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Proof</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="proof-upload"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 text-green-600 mx-auto" />
                        <p className="text-green-600 font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setUploadedFile(null);
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600 font-medium">Click to upload proof</p>
                        <p className="text-sm text-gray-500">Images, PDF, or documents (max 10MB)</p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                          <Image className="h-4 w-4" />
                          <span>JPG, PNG, GIF</span>
                          <span className="mx-2">•</span>
                          <FileText className="h-4 w-4" />
                          <span>PDF, DOC, DOCX</span>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Feedback */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Task Feedback</h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what you accomplished, any challenges faced, people helped, etc."
                  rows={5}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  {feedback.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUploading || myAssignments.length === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Submit Proof
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
