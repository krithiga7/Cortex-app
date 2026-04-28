import { useState, useRef } from 'react';
import { Upload, Mic, FileText, Image, Play, Square, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { processTextInput, processImageInput, processAudioInput, fileToBase64, MultimodalResponse } from '@/services/geminiMultimodal';

export default function MultimodalInput() {
  const [activeMode, setActiveMode] = useState<'image' | 'audio'>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<MultimodalResponse | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', { description: 'Please upload an image file (JPG, PNG)' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Image must be less than 10MB' });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    
    toast.success('Image uploaded', { description: file.name });
  };

  // Handle audio upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Invalid file type', { description: 'Please upload an audio file' });
      return;
    }

    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    setResult(null);
    
    toast.success('Audio uploaded', { description: file.name });
  };

  // Start/stop voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
          
          setAudioFile(audioFile);
          setAudioPreview(URL.createObjectURL(audioBlob));
          setResult(null);
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          
          toast.success('Recording complete', { description: 'Audio ready for processing' });
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast.info('Recording started...', { description: 'Click stop when finished' });
      } catch (error) {
        toast.error('Microphone access denied', { description: 'Please allow microphone access' });
      }
    }
  };

  // Process input with Gemini
  const handleSubmit = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      let response: MultimodalResponse;

      if (activeMode === 'image') {
        if (!imageFile) {
          toast.error('Please upload an image');
          setIsProcessing(false);
          return;
        }
        const base64 = await fileToBase64(imageFile);
        response = await processImageInput(base64);
      } else {
        if (!audioFile) {
          toast.error('Please upload or record audio');
          setIsProcessing(false);
          return;
        }
        const base64 = await fileToBase64(audioFile);
        response = await processAudioInput(base64);
      }

      setResult(response);

      if (response.status === 'success') {
        toast.success('Processing complete!', {
          description: `Extracted ${response.extractedText.length} characters`
        });
      } else {
        toast.error('Processing failed', { description: response.error });
      }
    } catch (error) {
      toast.error('Processing error', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioFile(null);
    setAudioPreview(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { mode: 'image' as const, label: 'Image/OCR', icon: Image, color: 'purple' },
          { mode: 'audio' as const, label: 'Voice/Audio', icon: Mic, color: 'green' }
        ].map(({ mode, label, icon: Icon, color }) => (
          <button
            key={mode}
            onClick={() => { setActiveMode(mode); handleReset(); }}
            className={`p-4 rounded-xl border-2 transition-all ${
              activeMode === mode
                ? `border-${color}-500 bg-${color}-50 shadow-md`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <Icon className={`h-6 w-6 mx-auto mb-2 ${activeMode === mode ? `text-${color}-600` : 'text-gray-400'}`} />
            <div className={`text-sm font-medium ${activeMode === mode ? `text-${color}-900` : 'text-gray-600'}`}>
              {label}
            </div>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Image Input */}
        {activeMode === 'image' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload Image for OCR (Printed or Handwritten Text)
            </label>
            
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Image className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG (MAX 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-contain rounded-lg border border-gray-300 bg-gray-50"
                />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Audio Input */}
        {activeMode === 'audio' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload Audio or Record Voice
            </label>

            {/* Record Button */}
            <div className="flex justify-center">
              <button
                onClick={toggleRecording}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Start Recording
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            {/* Upload Audio */}
            {!audioPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Upload audio file</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                />
              </label>
            ) : (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {audioFile?.name || 'Recording'}
                  </span>
                  <button
                    onClick={() => { setAudioFile(null); setAudioPreview(null); }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <audio controls src={audioPreview} className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing with Gemini...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Process with Gemini
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-xl border-2 p-6 shadow-sm ${
          result.status === 'success' 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            {result.status === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <h3 className="text-lg font-bold text-gray-900">
              {result.status === 'success' ? 'Processing Result' : 'Processing Failed'}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Input Type:</span>
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium capitalize">
                {result.inputType}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-white border border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Extracted Text:</div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {result.extractedText || 'No text extracted'}
              </div>
            </div>

            {result.error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-sm text-red-900">
                Error: {result.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
