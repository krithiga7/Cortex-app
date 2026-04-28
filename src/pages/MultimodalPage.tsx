import { AppLayout } from '@/components/layout/AppLayout';
import MultimodalInput from '@/components/MultimodalInput';
import { Zap, FileText, Image, Mic } from 'lucide-react';

export default function MultimodalPage() {
  return (
    <AppLayout
      title="Multimodal Input Processing"
      subtitle="Submit emergency requests via text, image, or voice - powered by Gemini AI"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Input Area */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <MultimodalInput />
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Supported Inputs</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Text Input</div>
                  <div className="text-xs text-blue-700">Paste or type emergency requests</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <Image className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-purple-900">Image/OCR</div>
                  <div className="text-xs text-purple-700">Extract printed & handwritten text</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <Mic className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-900">Voice/Audio</div>
                  <div className="text-xs text-green-700">Transcribe voice notes & recordings</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                <div className="text-sm text-gray-700">Select input mode (text/image/voice)</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                <div className="text-sm text-gray-700">Upload or enter your content</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">3</div>
                <div className="text-sm text-gray-700">Gemini AI processes the input</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">4</div>
                <div className="text-sm text-gray-700">Extracted text displayed instantly</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-bold text-gray-900">Powered by Gemini AI</h3>
            </div>
            <p className="text-xs text-gray-700">
              Single AI engine handles all input types: text cleaning, image OCR (printed + handwritten), and voice transcription.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
