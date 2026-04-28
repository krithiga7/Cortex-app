import { useState, useCallback } from 'react';
import { Upload, X, FileText, Image, Loader2, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { validateFile, processFile } from '@/services/ocr/ocrService';
import { aiService } from '@/services/ai';
import { OCRFileMetadata, OCRProgress, OCRResult } from '@/types/ocr';
import { cortexStore } from '@/store/cortex';

export default function OCRUpload() {
  const [fileMetadata, setFileMetadata] = useState<OCRFileMetadata | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [editedText, setEditedText] = useState('');
  const [progress, setProgress] = useState<OCRProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    setAnalysisResult(null);
    setEditedText('');
    
    toast.success('File uploaded', {
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    });
  }, []);

  const handleProcessOCR = async () => {
    if (!fileMetadata) return;

    setIsProcessing(true);
    setProgress({ status: 'loading', progress: 0, message: 'Initializing OCR...' });

    try {
      const result = await processFile(fileMetadata, (prog) => {
        setProgress(prog);
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
      setProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Processing failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!editedText.trim()) {
      toast.error('No text to analyze', {
        description: 'Please extract or enter text first'
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysis = await aiService.analyzeOCRText(editedText);
      setAnalysisResult(analysis);

      toast.success('AI Analysis Complete!', {
        description: `${analysis.type} request identified | Priority: ${analysis.overallPriorityScore}/100`
      });

      // Create request in system
      const newRequest = {
        id: `R${Math.floor(Math.random() * 9000) + 1000}`,
        type: analysis.type === 'Document' ? 'Food' : analysis.type,
        people: analysis.peopleCount,
        location: analysis.location,
        priority: analysis.urgency,
        score: analysis.overallPriorityScore,
        status: 'Pending' as const,
        createdAt: 'just now',
        description: analysis.description,
        source: 'OCR' as const,
        urgency: analysis.urgencyScore,
        severity: analysis.severityScore,
        timeDecay: 0,
        locationRisk: analysis.locationRiskScore,
        imageUrl: fileMetadata?.previewUrl,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      };

      cortexStore.addRequest(newRequest);
    } catch (error) {
      toast.error('AI Analysis Failed', {
        description: 'Please try again'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (fileMetadata?.previewUrl) {
      URL.revokeObjectURL(fileMetadata.previewUrl);
    }
    setFileMetadata(null);
    setOcrResult(null);
    setEditedText('');
    setProgress(null);
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!fileMetadata ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mb-2">Supported: JPG, PNG, WebP, PDF (MAX 10MB)</p>
            <p className="text-xs text-blue-600">Medical prescriptions, ID proofs, ration cards, request letters</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileSelect}
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* File Preview */}
          <div className="relative rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                {fileMetadata.fileType === 'application/pdf' ? (
                  <FileText className="h-5 w-5 text-red-600" />
                ) : (
                  <Image className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">{fileMetadata.fileName}</div>
                  <div className="text-xs text-gray-500">
                    {(fileMetadata.fileSize / 1024 / 1024).toFixed(2)}MB • {fileMetadata.fileType}
                  </div>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Image/PDF Preview */}
            {fileMetadata.fileType.startsWith('image/') ? (
              <img
                src={fileMetadata.previewUrl}
                alt="Preview"
                className="w-full h-64 object-contain bg-gray-50"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-50">
                <FileText className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          {progress && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                {progress.status === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : progress.status === 'done' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900">{progress.message}</div>
                  <div className="mt-1 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!ocrResult && (
              <button
                onClick={handleProcessOCR}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Extract Text (OCR)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Extracted Text */}
      {ocrResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Extracted Text</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Confidence: {ocrResult.confidence}%</span>
              <span>•</span>
              <span>{(ocrResult.processingTime / 1000).toFixed(1)}s</span>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              rows={8}
              placeholder="Extracted text will appear here. You can edit it manually..."
            />
            <Edit2 className="absolute top-3 right-3 h-4 w-4 text-gray-400" />
          </div>

          {/* AI Analysis Button */}
          <button
            onClick={handleAnalyzeWithAI}
            disabled={isAnalyzing || !editedText.trim()}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Analyze with AI & Create Request
              </>
            )}
          </button>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-4 p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">AI Analysis Results</h3>
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                  {analysisResult.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Priority Score</div>
                  <div className="text-2xl font-bold text-purple-600">{analysisResult.overallPriorityScore}/100</div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Urgency</div>
                  <div className={`text-lg font-bold ${
                    analysisResult.urgency === 'High' ? 'text-red-600' :
                    analysisResult.urgency === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {analysisResult.urgency}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Location</div>
                  <div className="font-bold text-gray-900">{analysisResult.location}</div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">People Affected</div>
                  <div className="font-bold text-gray-900">{analysisResult.peopleCount}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Recommended Resource</div>
                <div className="font-bold text-blue-600">{analysisResult.recommendedVolunteer}</div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">AI Explanation</div>
                <div className="text-sm text-gray-900">{analysisResult.explanation}</div>
              </div>

              {analysisResult.keyEntities && analysisResult.keyEntities.length > 0 && (
                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Key Entities Found</div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keyEntities.map((entity: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
