import { useSearchParams, Link } from 'react-router-dom';
import LayerEditor from '../../components/layers/LayerEditor';

export default function LayerEditorPage() {
  const [params] = useSearchParams();
  return (
    <div className="max-w-7xl mx-auto pt-20">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-semibold text-gray-900">Layer Editor</h1>
        <p className="text-sm text-gray-500">
          Compose images and text, personalize with tokens, and export one image per CSV row. Everything runs on your device.{' '}
          <Link to="/features/modern-ai-image" className="text-violet-600 hover:underline">Generate an image</Link>
        </p>
      </div>
      <LayerEditor initialImageId={params.get('image') || undefined} />
    </div>
  );
}
