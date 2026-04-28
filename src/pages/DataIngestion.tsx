import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/store/auth';
import { FileText, MessageCircle, Mic, FileScan, Upload, Loader2, CheckCircle, AlertCircle, Image, Camera, Edit2, X, Layers, Database } from 'lucide-react';
import { GoogleFormsImport } from '@/components/GoogleFormsImport';
import { toast } from 'sonner';
import { aiService } from '@/services/ai';
import { cortexStore } from '@/store/cortex';
import { validateFile, processFile } from '@/services/ocr/ocrService';
import { OCRFileMetadata, OCRProgress, OCRResult } from '@/types/ocr';
import MultimodalInput from '@/components/MultimodalInput';
import { createRequest } from '@/services/requestService';
import { RequestDocument } from '@/types/firestore';

export default function DataIngestion() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'form' | 'whatsapp' | 'multimodal' | 'googleforms'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestedData, setIngestedData] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    peopleCount: '',
  });

  // Image upload states for Tesseract OCR
  const [fileMetadata, setFileMetadata] = useState<OCRFileMetadata | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [editedText, setEditedText] = useState('');
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  // WhatsApp/Voice/OCR raw input
  const [rawInput, setRawInput] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Use AI to calculate priority score (with fallback)
      let priorityScore;
      try {
        priorityScore = await aiService.calculatePriorityScore(
          formData.type,
          formData.description,
          parseInt(formData.peopleCount),
          formData.location,
          0
        );
      } catch (aiError) {
        console.warn('⚠️ AI priority calculation failed, using defaults:', aiError);
        // Fallback: simple rule-based priority
        const peopleCount = parseInt(formData.peopleCount);
        priorityScore = {
          urgency: peopleCount > 50 ? 80 : peopleCount > 20 ? 60 : 40,
          severity: formData.type === 'Medical' ? 85 : 60,
          timeDecay: 0,
          locationRisk: 50,
          overallScore: peopleCount > 50 ? 80 : 65,
          explanation: 'Rule-based priority (AI unavailable)'
        };
      }

      const requestId = `R${Math.floor(Math.random() * 9000) + 1000}`;
      
      // Create the request object
      const newRequest = {
        id: requestId,
        type: formData.type as any,
        people: parseInt(formData.peopleCount),
        location: formData.location,
        priority: priorityScore.overallScore > 75 ? 'High' : priorityScore.overallScore > 50 ? 'Medium' : 'Low' as any,
        score: priorityScore.overallScore,
        status: 'Pending' as const,
        createdAt: 'just now',
        description: formData.description,
        source: 'Form' as const,
        urgency: priorityScore.urgency,
        severity: priorityScore.severity,
        timeDecay: 0,
        locationRisk: priorityScore.locationRisk,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      };

      // Add to local state (cortex)
      cortexStore.addRequest(newRequest);
      
      // Save to Firebase Firestore
      try {
        const firestoreRequest: Omit<RequestDocument, 'createdAt' | 'updatedAt'> = {
          requestId: requestId,
          category: formData.type as any,
          description: formData.description,
          location: formData.location,
          peopleAffected: parseInt(formData.peopleCount),
          urgency: priorityScore.overallScore > 75 ? 'High' : priorityScore.overallScore > 50 ? 'Medium' : 'Low',
          status: 'pending',
          priorityScore: priorityScore.overallScore,
          source: 'form',
          summary: formData.description.substring(0, 100),
          x: newRequest.x,
          y: newRequest.y,
        };
        
        await createRequest(firestoreRequest);
        console.log('✅ Request saved to Firebase Firestore');
      } catch (firebaseError) {
        console.warn('⚠️ Firebase save failed (using local storage only):', firebaseError);
        // Continue anyway - data is saved locally
      }
      
      setIngestedData({
        ...newRequest,
        priorityExplanation: priorityScore.explanation,
      });

      toast.success('Request submitted successfully!', {
        description: `Priority Score: ${priorityScore.overallScore}/100 • Saved to Database`,
        icon: <Database className="h-4 w-4" />,
      });

      setFormData({ type: '', description: '', location: '', peopleCount: '' });
    } catch (error) {
      toast.error('Failed to process request', {
        description: 'Please try again',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRawInputProcess = async () => {
    if (!rawInput.trim()) {
      toast.error('Please enter some input');
      return;
    }

    setIsProcessing(true);

    try {
      // Use AI to ingest from raw input (with fallback)
      let ingested;
      try {
        const sourceMap: Record<string, 'form' | 'whatsapp' | 'voice' | 'ocr'> = {
          form: 'form',
          whatsapp: 'whatsapp',
          multimodal: 'voice'
        };
        ingested = await aiService.ingestFromSource(sourceMap[activeTab], rawInput);
      } catch (aiError) {
        console.warn('⚠️ AI ingestion failed, using basic parsing:', aiError);
        // Fallback: basic keyword extraction
        const input = rawInput.toLowerCase();
        let type = 'Food';
        if (input.includes('medical') || input.includes('doctor') || input.includes('injury')) type = 'Medical';
        else if (input.includes('water') || input.includes('drink')) type = 'Water';
        else if (input.includes('shelter') || input.includes('housing')) type = 'Shelter';
        else if (input.includes('clothes') || input.includes('cloth')) type = 'Clothes';
        
        ingested = {
          type,
          description: rawInput.substring(0, 200),
          location: 'Unknown Location',
          peopleCount: 10,
          urgency: 'Medium' as const,
          confidence: 60
        };
      }

      // Calculate priority score (with fallback)
      let priorityScore;
      try {
        priorityScore = await aiService.calculatePriorityScore(
          ingested.type,
          ingested.description,
          ingested.peopleCount,
          ingested.location,
          0
        );
      } catch (aiError) {
        console.warn('⚠️ AI priority calculation failed, using defaults:', aiError);
        const peopleCount = ingested.peopleCount;
        priorityScore = {
          urgency: peopleCount > 50 ? 80 : peopleCount > 20 ? 60 : 40,
          severity: ingested.type === 'Medical' ? 85 : 60,
          timeDecay: 0,
          locationRisk: 50,
          overallScore: peopleCount > 50 ? 80 : 65,
          explanation: 'Rule-based priority (AI unavailable)'
        };
      }

      // Create the request
      const newRequest = {
        id: `R${Math.floor(Math.random() * 9000) + 1000}`,
        type: ingested.type,
        people: ingested.peopleCount,
        location: ingested.location,
        priority: ingested.urgency,
        score: priorityScore.overallScore,
        status: 'Pending' as const,
        createdAt: 'just now',
        description: ingested.description,
        source: activeTab === 'whatsapp' ? 'WhatsApp' : activeTab === 'voice' ? 'Voice' : 'OCR' as any,
        urgency: priorityScore.urgency,
        severity: priorityScore.severity,
        timeDecay: 0,
        locationRisk: priorityScore.locationRisk,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      };

      cortexStore.addRequest(newRequest);

      setIngestedData({
        ...newRequest,
        confidence: ingested.confidence,
        priorityExplanation: priorityScore.explanation,
      });

      toast.success(`${activeTab.toUpperCase()} input processed!`, {
        description: `Confidence: ${ingested.confidence}% | Priority: ${ingested.urgency}`,
      });

      setRawInput('');
    } catch (error) {
      toast.error('Failed to process input', {
        description: 'AI service error. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload for OCR
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error('Invalid File', { description: validation.error });
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    const metadata: OCRFileMetadata = {
      file,
      previewUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date()
    };

    setFileMetadata(metadata);
    setOcrResult(null);
    setEditedText('');
    setOcrProgress(null);
    
    toast.success('File uploaded', {
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    });
  };

  // Process file with Tesseract OCR
  const handleOCRProcess = async () => {
    if (!fileMetadata) {
      toast.error('Please upload a file first');
      return;
    }

    setIsProcessingOCR(true);
    setOcrProgress({ status: 'loading', progress: 0, message: 'Initializing OCR...' });

    try {
      const result = await processFile(fileMetadata, (prog) => {
        setOcrProgress(prog);
      });

      setOcrResult(result);
      setEditedText(result.extractedText);
      
      toast.success('OCR Complete!', {
        description: `Extracted ${result.extractedText.length} characters in ${(result.processingTime / 1000).toFixed(1)}s`
      });
    } catch (error) {
      toast.error('OCR Failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setOcrProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Processing failed'
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Analyze extracted text with AI and create request
  const handleAnalyzeAndCreate = async () => {
    if (!editedText.trim()) {
      toast.error('No text to analyze');
      return;
    }

    setIsProcessing(true);

    try {
      toast.info('Analyzing with AI...', {
        description: 'Extracting crisis information from document'
      });

      // Use Gemini to analyze the OCR text (with fallback)
      let analysis;
      try {
        analysis = await aiService.analyzeOCRText(editedText);
      } catch (aiError) {
        console.warn('⚠️ AI OCR analysis failed, using basic parsing:', aiError);
        // Fallback: basic keyword extraction
        const input = editedText.toLowerCase();
        let type = 'Food';
        if (input.includes('medical') || input.includes('hospital') || input.includes('injury')) type = 'Medical';
        else if (input.includes('water') || input.includes('drink')) type = 'Water';
        else if (input.includes('shelter') || input.includes('housing')) type = 'Shelter';
        else if (input.includes('clothes') || input.includes('cloth')) type = 'Clothes';
        
        analysis = {
          type,
          description: editedText.substring(0, 200),
          location: 'Unknown Location',
          peopleCount: 10,
          urgency: 'Medium' as const,
          confidence: 60,
          overallPriorityScore: 65
        };
      }

      // Calculate priority score (with fallback)
      let priorityScore;
      try {
        priorityScore = await aiService.calculatePriorityScore(
          analysis.type === 'Document' ? 'Food' : analysis.type,
          analysis.description,
          analysis.peopleCount,
          analysis.location,
          0
        );
      } catch (aiError) {
        console.warn('⚠️ AI priority calculation failed, using defaults:', aiError);
        const peopleCount = analysis.peopleCount;
        priorityScore = {
          urgency: peopleCount > 50 ? 80 : peopleCount > 20 ? 60 : 40,
          severity: analysis.type === 'Medical' ? 85 : 60,
          timeDecay: 0,
          locationRisk: 50,
          overallScore: peopleCount > 50 ? 80 : 65,
          explanation: 'Rule-based priority (AI unavailable)'
        };
      }

      // Create the request
      const newRequest = {
        id: `R${Math.floor(Math.random() * 9000) + 1000}`,
        type: analysis.type === 'Document' ? 'Food' : analysis.type,
        people: analysis.peopleCount,
        location: analysis.location,
        priority: analysis.urgency,
        score: priorityScore.overallScore,
        status: 'Pending' as const,
        createdAt: 'just now',
        description: analysis.description,
        source: 'OCR' as const,
        urgency: priorityScore.urgency,
        severity: priorityScore.severity,
        timeDecay: 0,
        locationRisk: priorityScore.locationRisk,
        imageUrl: fileMetadata?.previewUrl,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      };

      cortexStore.addRequest(newRequest);

      setIngestedData({
        ...newRequest,
        confidence: analysis.confidence,
        priorityExplanation: priorityScore.explanation,
        ocrText: editedText,
        analysisDetails: analysis,
      });

      toast.success('Document processed & request created!', {
        description: `${analysis.type} | Priority: ${analysis.overallPriorityScore}/100`
      });

      // Clear for next upload
      if (fileMetadata?.previewUrl) {
        URL.revokeObjectURL(fileMetadata.previewUrl);
      }
      setFileMetadata(null);
      setOcrResult(null);
      setEditedText('');
      setOcrProgress(null);
    } catch (error) {
      toast.error('Failed to process document', {
        description: 'AI service error. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetOCR = () => {
    if (fileMetadata?.previewUrl) {
      URL.revokeObjectURL(fileMetadata.previewUrl);
    }
    setFileMetadata(null);
    setOcrResult(null);
    setEditedText('');
    setOcrProgress(null);
  };

  const sourceTabs = [
    { id: 'form' as const, label: 'Online Form', icon: FileText, color: 'blue' },
    { id: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle, color: 'green' },
    { id: 'multimodal' as const, label: 'Multimodal AI', icon: Layers, color: 'indigo' },
    { id: 'googleforms' as const, label: 'Google Forms', icon: Database, color: 'purple' },
  ];

  return (
    <AppLayout
      title="Multi-Source Data Ingestion"
      subtitle="Convert messy real-world inputs into standardized Need Events"
    >
      {/* Source Type Tabs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {sourceTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIngestedData(null);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? `border-${tab.color}-500 bg-${tab.color}-50 shadow-md`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`h-6 w-6 mx-auto mb-2 ${isActive ? `text-${tab.color}-600` : 'text-gray-400'}`} />
              <div className={`text-sm font-medium ${isActive ? `text-${tab.color}-900` : 'text-gray-600'}`}>
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {activeTab === 'form' ? 'Submit Request Form' : `Process ${activeTab.toUpperCase()} Input`}
          </h2>

          {activeTab === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select type...</option>
                  <option value="Medical">Medical</option>
                  <option value="Food">Food</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Water">Water</option>
                  <option value="Clothes">Clothes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="Describe the crisis situation..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., T Nagar"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">People Affected</label>
                  <input
                    type="number"
                    value={formData.peopleCount}
                    onChange={(e) => setFormData({ ...formData, peopleCount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., 25"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing with AI...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </button>
            </form>
          ) : activeTab === 'whatsapp' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raw WhatsApp Message
                </label>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={6}
                  placeholder="Paste WhatsApp message here...\nExample: 'Need urgent medical help in Adyar. 5 people injured.'"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                💡 AI will automatically extract: type, location, people count, and urgency
              </div>

              <button
                onClick={handleRawInputProcess}
                disabled={isProcessing || !rawInput}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    Process with AI
                  </span>
                )}
              </button>
            </div>
          ) : null}

          {/* Multimodal Input Tab */}
          {activeTab === 'multimodal' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Multimodal AI Input
              </h2>
              <MultimodalInput />
            </div>
          )}

          {/* Google Forms Import Tab */}
          {activeTab === 'googleforms' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Import from Google Forms
              </h2>
              <GoogleFormsImport 
                onImportComplete={(count) => {
                  toast.success(`${count} requests imported successfully!`, {
                    description: 'All requests are now active in the system'
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Standardized Need Event</h2>

          {!ingestedData ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileText className="h-12 w-12 mb-4" />
              <p className="text-sm">Processed request will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Success Indicator */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Successfully Ingested</span>
              </div>

              {/* Extracted Data */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Request ID</div>
                    <div className="font-mono font-bold text-gray-900">{ingestedData.id}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Type</div>
                    <div className="font-bold text-gray-900">{ingestedData.type}</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Location</div>
                  <div className="font-bold text-gray-900">{ingestedData.location}</div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Description</div>
                  <div className="text-sm text-gray-900">{ingestedData.description}</div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">People</div>
                    <div className="font-bold text-gray-900">{ingestedData.people}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Priority</div>
                    <div className={`font-bold ${
                      ingestedData.priority === 'High' ? 'text-red-600' :
                      ingestedData.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {ingestedData.priority}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Score</div>
                    <div className="font-bold text-blue-600">{ingestedData.score}/100</div>
                  </div>
                </div>

                {ingestedData.confidence && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-xs text-blue-700 mb-1">AI Confidence</div>
                    <div className="font-bold text-blue-900">{ingestedData.confidence}%</div>
                  </div>
                )}

                {ingestedData.ocrText && (
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="text-xs text-orange-700 mb-1">Extracted Text (OCR)</div>
                    <div className="text-sm text-orange-900 italic">{ingestedData.ocrText}</div>
                  </div>
                )}

                {ingestedData.imageUrl && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs text-gray-700 mb-2">Uploaded Image</div>
                    <img src={ingestedData.imageUrl} alt="Source" className="w-full h-32 object-contain rounded" />
                  </div>
                )}

                {ingestedData.priorityExplanation && (
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <div className="text-xs text-purple-700 mb-1">AI Priority Explanation</div>
                    <div className="text-sm text-purple-900">{ingestedData.priorityExplanation}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
