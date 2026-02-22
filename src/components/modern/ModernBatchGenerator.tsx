import React, { useState, useRef } from 'react';
import { Upload, Download, Play, Pause, X, Check, AlertCircle, FileText, StopCircle } from 'lucide-react';
import FullScreenLayout from '../layout/FullScreenLayout';
import ModernTopHeader from '../layout/ModernTopHeader';
import LeftPanel, { LeftPanelSection, LeftPanelFooter } from '../layout/LeftPanel';
import RightPanel from '../layout/RightPanel';
import EmptyState from '../layout/EmptyState';
import GuideContent from '../layout/GuideContent';
import APIContent from '../layout/APIContent';
import { generateImage } from '../../services/imageGenerationService';

interface BatchItem {
  id: number;
  data: Record<string, string>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

interface ModernBatchGeneratorProps {
  tokens: Record<string, string>;
}

const ModernBatchGenerator: React.FC<ModernBatchGeneratorProps> = ({ tokens }) => {
  const [activeTab, setActiveTab] = useState<'result' | 'guide' | 'api'>('result');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const [prompt, setPrompt] = useState('');
  const [progress, setProgress] = useState(0);
  const cancelRef = useRef(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const items: BatchItem[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const data: Record<string, string> = {};
          headers.forEach((header, i) => {
            data[header] = values[i] || '';
          });
          return {
            id: index,
            data,
            status: 'pending' as const
          };
        });

      setBatchItems(items);
    };
    reader.readAsText(file);
  };

  const resolvePromptForItem = (template: string, itemData: Record<string, string>): string => {
    let resolved = template;
    Object.entries(itemData).forEach(([key, value]) => {
      resolved = resolved.replace(new RegExp(`\\[${key}\\]`, 'gi'), value);
    });
    Object.entries(tokens).forEach(([key, value]) => {
      resolved = resolved.replace(new RegExp(`\\[${key}\\]`, 'gi'), value);
    });
    return resolved;
  };

  const handleProcess = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setProgress(0);
    cancelRef.current = false;

    for (let i = 0; i < batchItems.length; i++) {
      if (cancelRef.current) break;

      setBatchItems(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: 'processing' } : item
      ));

      try {
        const resolvedPrompt = resolvePromptForItem(prompt, batchItems[i].data);
        const result = await generateImage(resolvedPrompt, {
          size: '1024x1024',
          quality: 'standard',
          category: 'batch-generation',
        });
        setBatchItems(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'completed', imageUrl: result.imageUrl } : item
        ));
      } catch (err: any) {
        setBatchItems(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'failed', error: err.message || 'Generation failed' } : item
        ));
      }

      setProgress(((i + 1) / batchItems.length) * 100);
    }

    setIsProcessing(false);
    cancelRef.current = false;
  };

  const handleCancel = () => {
    cancelRef.current = true;
  };

  const downloadTemplate = () => {
    const csvContent = 'name,company,email\nJohn Doe,Acme Inc,john@example.com\nJane Smith,Tech Corp,jane@example.com';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'batch-template.csv';
    link.click();
  };

  const leftPanelContent = (
    <LeftPanel>
      <LeftPanelSection title="Batch Generation">
        <p className="text-sm text-gray-600">Generate multiple personalized images from CSV data</p>
      </LeftPanelSection>

      <LeftPanelSection title="CSV File">
        <div className="space-y-3">
          <label className="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-violet-500 transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-600">
              {csvFile ? csvFile.name : 'Click to upload CSV file'}
            </span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button onClick={downloadTemplate} className="w-full text-sm text-violet-600 hover:text-violet-700 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>
      </LeftPanelSection>

      {batchItems.length > 0 && (
        <LeftPanelSection title="Preview Data">
          <div className="max-h-48 overflow-y-auto bg-gray-50 rounded p-3 text-xs">
            <div className="font-mono">
              {batchItems.slice(0, 5).map((item, idx) => (
                <div key={idx} className="mb-2">
                  {Object.entries(item.data).map(([key, value]) => (
                    <div key={key}><span className="font-semibold">{key}:</span> {value}</div>
                  ))}
                  {idx < 4 && <hr className="my-2" />}
                </div>
              ))}
              {batchItems.length > 5 && <div className="text-gray-500 mt-2">...and {batchItems.length - 5} more rows</div>}
            </div>
          </div>
        </LeftPanelSection>
      )}

      <LeftPanelSection title="Model">
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="openai">DALL-E 3</option>
          <option value="gemini">Gemini</option>
          <option value="imagen">Imagen 3</option>
        </select>
      </LeftPanelSection>

      <LeftPanelSection title="Prompt Template">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A professional portrait of [name] from [company]"
          className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">Use column names in brackets like [name], [company]</p>
      </LeftPanelSection>

      <LeftPanelFooter>
        {isProcessing ? (
          <button onClick={handleCancel} className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition-all">
            <StopCircle className="w-5 h-5" />Stop Processing
          </button>
        ) : (
          <button onClick={handleProcess} disabled={batchItems.length === 0 || !prompt.trim()} className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-violet-700 transition-all">
            <Play className="w-5 h-5" />Start Batch Generation
          </button>
        )}
        {isProcessing && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-violet-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-600 mt-1 text-center">{Math.round(progress)}% Complete</p>
          </div>
        )}
      </LeftPanelFooter>
    </LeftPanel>
  );

  const resultContent = batchItems.length > 0 ? (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-6 text-sm">
          <div><span className="font-semibold">{batchItems.filter(i => i.status === 'completed').length}</span> <span className="text-gray-600">Completed</span></div>
          <div><span className="font-semibold">{batchItems.filter(i => i.status === 'processing').length}</span> <span className="text-gray-600">Processing</span></div>
          <div><span className="font-semibold">{batchItems.filter(i => i.status === 'failed').length}</span> <span className="text-gray-600">Failed</span></div>
        </div>
        <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-violet-700 transition-colors"><Download className="w-4 h-4" />Download All</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {batchItems.map((item) => (
          <div key={item.id} className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {item.status === 'completed' && item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : item.status === 'processing' ? (
                <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
              ) : item.status === 'failed' ? (
                <AlertCircle className="w-8 h-8 text-red-500" />
              ) : (
                <FileText className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="p-2 text-xs">
              <div className="font-medium truncate">{item.data.name || 'Item ' + (item.id + 1)}</div>
              <div className={`flex items-center gap-1 mt-1 ${
                item.status === 'completed' ? 'text-green-600' :
                item.status === 'processing' ? 'text-blue-600' :
                item.status === 'failed' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {item.status === 'completed' && <Check className="w-3 h-3" />}
                {item.status === 'failed' && <X className="w-3 h-3" />}
                <span className="capitalize">{item.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <EmptyState icon={FileText} title="No Batch Loaded" description="Upload a CSV file to begin batch generation" tips={['Download the template to see the format', 'Each row will generate one image', 'Use column names in your prompt', 'Process up to 1000 images at once']} />
  );

  return (
    <>
      <ModernTopHeader title="Batch Generation" breadcrumbs={[{ label: 'Editor', path: '/editor' }, { label: 'Batch Generation' }]} />
      <FullScreenLayout leftPanel={leftPanelContent} rightPanel={<RightPanel activeTab={activeTab} onTabChange={setActiveTab} resultContent={resultContent} guideContent={<GuideContent steps={[{ title: 'Upload CSV', description: 'Upload a CSV file with your data' }, { title: 'Map Columns', description: 'Use column names in brackets in your prompt' }, { title: 'Select Model', description: 'Choose your AI model' }, { title: 'Process', description: 'Start batch generation' }]} />} apiContent={<APIContent endpoint="/api/v1/batch/generate" method="POST" description="Generate multiple images from CSV data." parameters={[]} codeExamples={[{ language: 'JavaScript', code: 'const formData = new FormData();\nformData.append("csv", file);\nfetch("/api/v1/batch/generate", { method: "POST", body: formData });' }]} responseExample='{"jobId": "123", "status": "processing"}' rateLimit="10 batches per hour" />} />} />
    </>
  );
};

export default ModernBatchGenerator;
