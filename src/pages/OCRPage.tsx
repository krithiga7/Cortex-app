import { AppLayout } from '@/components/layout/AppLayout';
import OCRUpload from '@/components/ocr/OCRUpload';
import { FileText, Camera, Zap, Shield } from 'lucide-react';

export default function OCRPage() {
  return (
    <AppLayout
      title="Document Scanner & OCR"
      subtitle="Upload emergency documents for AI-powered extraction and analysis"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Upload Area */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <OCRUpload />
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Supported Documents</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-900">Medical Documents</div>
                  <div className="text-xs text-red-700">Prescriptions, medical records, health cards</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-900">ID & Ration Cards</div>
                  <div className="text-xs text-blue-700">Identity proofs, ration cards, certificates</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <Camera className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-900">Request Letters</div>
                  <div className="text-xs text-green-700">Handwritten requests, applications, forms</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                <div className="text-sm text-gray-700">Upload image or PDF document</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                <div className="text-sm text-gray-700">OCR extracts text automatically</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</div>
                <div className="text-sm text-gray-700">Edit extracted text if needed</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">4</div>
                <div className="text-sm text-gray-700">AI analyzes & creates crisis request</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-bold text-gray-900">AI-Powered Analysis</h3>
            </div>
            <p className="text-xs text-gray-700">
              Gemini AI analyzes extracted text to identify urgency, priority, location, and recommends appropriate volunteer resources.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
