import { FileText, MessageCircle, Mic, FileScan, Plus } from "lucide-react";

const ingestionSources = [
  { 
    name: "Online Form", 
    icon: FileText, 
    count: 42, 
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  { 
    name: "WhatsApp", 
    icon: MessageCircle, 
    count: 38, 
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700"
  },
  { 
    name: "Voice Notes", 
    icon: Mic, 
    count: 24, 
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700"
  },
  { 
    name: "OCR (Handwritten)", 
    icon: FileScan, 
    count: 16, 
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700"
  },
];

export function DataIngestionPanel() {
  const total = ingestionSources.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-gray-900">Multi-Source Data Ingestion</h3>
          <p className="text-xs text-gray-600 mt-0.5">Collecting requests from all channels</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
          <span className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
          <span className="text-xs font-medium text-green-700">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {ingestionSources.map((source) => {
          const Icon = source.icon;
          return (
            <div
              key={source.name}
              className={`p-3 rounded-lg border ${source.bgColor} ${source.borderColor}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-8 w-8 rounded-lg ${source.color} grid place-items-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">{source.name}</div>
                  <div className={`text-lg font-bold ${source.textColor}`}>{source.count}</div>
                </div>
              </div>
              <div className="w-full bg-white/60 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${source.color}`}
                  style={{ width: `${(source.count / total) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Total Requests Processed</span>
          <span className="text-lg font-bold text-gray-900">{total}</span>
        </div>
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" />
          <span>Submit New Request</span>
        </button>
      </div>
    </div>
  );
}
