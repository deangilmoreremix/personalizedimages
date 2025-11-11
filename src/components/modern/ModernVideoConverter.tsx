import React, { useState } from 'react';
import { Upload, Play, Download, Film, Music, Wand2, RefreshCw } from 'lucide-react';
import FullScreenLayout from '../layout/FullScreenLayout';
import ModernTopHeader from '../layout/ModernTopHeader';
import LeftPanel, { LeftPanelSection, LeftPanelFooter } from '../layout/LeftPanel';
import RightPanel from '../layout/RightPanel';
import EmptyState from '../layout/EmptyState';
import GuideContent from '../layout/GuideContent';
import APIContent from '../layout/APIContent';

const ModernVideoConverter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'result' | 'guide' | 'api'>('result');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState(5);
  const [effect, setEffect] = useState('zoom');
  const [resolution, setResolution] = useState('1080p');
  const [preset, setPreset] = useState('instagram');

  const effects = ['Zoom', 'Pan', 'Ken Burns', 'Parallax', 'Fade'];
  const resolutions = ['720p', '1080p', '4K'];
  const presets = [
    { id: 'instagram', name: 'Instagram', ratio: '1:1' },
    { id: 'tiktok', name: 'TikTok', ratio: '9:16' },
    { id: 'youtube', name: 'YouTube', ratio: '16:9' }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSourceImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
    setIsGenerating(false);
    setActiveTab('result');
  };

  const leftPanelContent = (
    <LeftPanel>
      <LeftPanelSection title="Video Converter">
        <p className="text-sm text-gray-600">Convert images to videos with effects and audio</p>
      </LeftPanelSection>

      <LeftPanelSection title="Source Image">
        <label className="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-violet-500 transition-colors">
          {sourceImage ? (
            <img src={sourceImage} alt="Source" className="max-h-32 mx-auto rounded" />
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-600">Click to upload image</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </LeftPanelSection>

      <LeftPanelSection title="Platform Preset">
        <div className="grid grid-cols-3 gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                preset === p.id ? 'bg-violet-100 text-violet-700 border-2 border-violet-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-gray-500">{p.ratio}</div>
            </button>
          ))}
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Duration">
        <div className="space-y-2">
          <input type="range" min="3" max="30" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>3s</span>
            <span className="font-semibold">{duration}s</span>
            <span>30s</span>
          </div>
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Effect">
        <div className="flex flex-wrap gap-2">
          {effects.map((e) => (
            <button
              key={e}
              onClick={() => setEffect(e.toLowerCase())}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                effect === e.toLowerCase() ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Resolution">
        <div className="flex gap-2">
          {resolutions.map((r) => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                resolution === r ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </LeftPanelSection>

      <LeftPanelFooter>
        <button onClick={handleGenerate} disabled={isGenerating || !sourceImage} className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 transition-all flex items-center justify-center gap-2">
          {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />Converting...</> : <><Film className="w-5 h-5" />Convert to Video</>}
        </button>
      </LeftPanelFooter>
    </LeftPanel>
  );

  const resultContent = videoUrl ? (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <video src={videoUrl} controls className="w-full" />
      </div>
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"><Download className="w-4 h-4" />Download MP4</button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"><Play className="w-4 h-4" /></button>
      </div>
    </div>
  ) : (
    <EmptyState icon={Film} title="No Video Generated" description="Upload an image and click Convert to create your video" tips={['Choose platform presets for optimal sizing', 'Ken Burns effect adds professional motion', 'Longer duration = larger file size']} />
  );

  return (
    <>
      <ModernTopHeader title="Video Converter" breadcrumbs={[{ label: 'Editor', path: '/editor' }, { label: 'Video Converter' }]} />
      <FullScreenLayout leftPanel={leftPanelContent} rightPanel={<RightPanel activeTab={activeTab} onTabChange={setActiveTab} resultContent={resultContent} guideContent={<GuideContent steps={[{ title: 'Upload Image', description: 'Choose your source image' }, { title: 'Select Preset', description: 'Pick platform-specific settings' }, { title: 'Choose Effect', description: 'Add motion effects' }, { title: 'Convert', description: 'Generate your video' }]} />} apiContent={<APIContent endpoint="/api/v1/video/convert" method="POST" description="Convert images to videos." parameters={[]} codeExamples={[{ language: 'JavaScript', code: 'fetch("/api/v1/video/convert", { method: "POST" });' }]} responseExample='{"videoUrl": "https://example.com/video.mp4"}' rateLimit="20 per hour" />} />} />
    </>
  );
};

export default ModernVideoConverter;
