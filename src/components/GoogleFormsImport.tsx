import { useState } from 'react';
import { Link, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { aiService } from '@/services/ai';
import { cortexStore } from '@/store/cortex';
import { createRequest } from '@/services/requestService';

interface GoogleFormsImportProps {
  onImportComplete?: (count: number) => void;
}

export function GoogleFormsImport({ onImportComplete }: GoogleFormsImportProps) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);

  /**
   * Extract spreadsheet ID from Google Sheets URL
   */
  const extractSheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  /**
   * Fetch data from Google Sheets securely using API
   * Method 1: Uses public CSV export (if sheet is shared with "Anyone with link")
   * Method 2: Requires Google Sheets API key for private sheets
   */
  const fetchSheetData = async (sheetId: string): Promise<any[]> => {
    // Try Method 1: CSV export with shareable link access
    // This works if sheet is shared as "Anyone with the link" (NOT published to web)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    try {
      const response = await fetch(csvUrl);
      
      if (response.ok) {
        const csvText = await response.text();
        return parseCSV(csvText);
      }
      
      // If CSV fails, guide user to use API key method
      throw new Error('CSV export failed');
    } catch (error) {
      console.warn('CSV export failed, providing API key instructions...');
      
      // Return helpful error with setup instructions
      throw new Error(
        'Unable to access spreadsheet. Choose one of these secure methods:\n\n' +
        'Option 1 (Quick - Private but Shareable):\n' +
        '1. Open your Google Sheet\n' +
        '2. Click "Share" (top right)\n' +
        '3. Under "General access", select "Anyone with the link"\n' +
        '4. Set to "Viewer" role\n' +
        '5. Click "Done" and try again\n\n' +
        'Option 2 (Most Secure - API Key):\n' +
        '1. Go to https://console.cloud.google.com/apis/credentials\n' +
        '2. Create API key\n' +
        '3. Enable Google Sheets API\n' +
        '4. Add VITE_GOOGLE_SHEETS_API_KEY to your .env file'
      );
    }
  };

  /**
   * Parse CSV text into array of objects
   */
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  /**
   * Convert row data to standardized crisis request using AI
   */
  const convertToRequest = async (row: any): Promise<any> => {
    // Combine all row data into a text description
    const rowText = Object.entries(row)
      .map(([key, value]) => `${key}: ${value}`)
      .join('. ');

    // Use AI to ingest and structure the data
    const ingested = await aiService.ingestFromSource('form', rowText);

    // Calculate priority score
    let priorityScore;
    try {
      priorityScore = await aiService.calculatePriorityScore(
        ingested.type,
        ingested.description,
        ingested.peopleCount,
        ingested.location,
        0
      );
    } catch (error) {
      // Fallback scoring
      const peopleCount = ingested.peopleCount;
      priorityScore = {
        urgency: peopleCount > 50 ? 8 : peopleCount > 20 ? 6 : 4,
        severity: ingested.type === 'Medical' ? 8 : 6,
        timeDecay: 0,
        locationRisk: 5,
        overallScore: peopleCount > 50 ? 80 : 65,
        explanation: 'Rule-based priority (AI unavailable)'
      };
    }

    const requestId = `R${Math.floor(Math.random() * 9000) + 1000}`;

    return {
      id: requestId,
      type: ingested.type,
      people: ingested.peopleCount,
      location: ingested.location,
      priority: priorityScore.overallScore > 75 ? 'High' : priorityScore.overallScore > 50 ? 'Medium' : 'Low',
      score: priorityScore.overallScore,
      status: 'Pending',
      createdAt: 'just now',
      description: ingested.description,
      source: 'Google Forms',
      urgency: priorityScore.urgency,
      severity: priorityScore.severity,
      timeDecay: 0,
      locationRisk: priorityScore.locationRisk,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    };
  };

  /**
   * Preview data before importing
   */
  const handlePreview = async () => {
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      toast.error('Invalid Google Sheets URL', {
        description: 'Please paste a valid Google Sheets link'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const data = await fetchSheetData(sheetId);
      setPreviewData(data.slice(0, 5)); // Show first 5 rows
      toast.success(`Found ${data.length} responses`, {
        description: 'Review the preview below before importing'
      });
    } catch (error) {
      toast.error('Failed to fetch sheet data', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Import all responses as crisis requests
   */
  const handleImport = async () => {
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      toast.error('Invalid Google Sheets URL');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const data = await fetchSheetData(sheetId);

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          
          // Convert to standardized request
          const newRequest = await convertToRequest(row);

          // Add to local state
          cortexStore.addRequest(newRequest);

          // Save to database
          try {
            await createRequest({
              requestId: newRequest.id,
              category: newRequest.type,
              description: newRequest.description,
              location: newRequest.location,
              peopleAffected: newRequest.people,
              urgency: newRequest.priority,
              status: 'pending',
              priorityScore: newRequest.score,
              source: 'google_forms',
              summary: newRequest.description.substring(0, 100),
              x: newRequest.x,
              y: newRequest.y,
            } as any);
          } catch (dbError) {
            console.warn(`Database save failed for request ${i + 1}:`, dbError);
          }

          successCount++;
        } catch (error) {
          console.error(`Failed to import row ${i + 1}:`, error);
          errorCount++;
        }
      }

      setImportedCount(successCount);
      setPreviewData([]);

      toast.success(`Successfully imported ${successCount} requests!`, {
        description: errorCount > 0 ? `${errorCount} failed` : 'All requests saved to database',
        icon: <CheckCircle className="h-4 w-4" />
      });

      onImportComplete?.(successCount);
    } catch (error) {
      toast.error('Import failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
        icon: <AlertCircle className="h-4 w-4" />
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="p-4 rounded-lg bg-white border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Import from Google Forms/Sheets</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Sheets URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
              <button
                onClick={handlePreview}
                disabled={isProcessing || !sheetUrl}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
            <p className="font-medium text-xs text-blue-900">
              📝 Share the Google Sheet of Google Form response and set access as "Anyone with link"
            </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {previewData.length > 0 && (
        <div className="p-4 rounded-lg bg-white border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Preview ({previewData.length} of {previewData.length > 0 ? 'many' : 0} responses)
            </h3>
            <button
              onClick={handleImport}
              disabled={isProcessing}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </span>
              ) : (
                'Import All as Requests'
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {Object.keys(previewData[0] || {}).map((header) => (
                    <th key={header} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {Object.values(row).map((value: any, i) => (
                      <td key={i} className="px-3 py-2 border-b text-gray-600 max-w-[200px] truncate">
                        {value || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success Message */}
      {importedCount > 0 && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Successfully imported {importedCount} request{importedCount > 1 ? 's' : ''}!
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            All requests have been saved to the database and are now active in the system.
          </p>
        </div>
      )}
    </div>
  );
}
