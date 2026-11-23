import { useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { decodeToMono16k, isMicSupported, isSpeechToTextSupported, startMicRecording, transcribe, type MicRecording } from '../../services/speechToText';

interface Props {
  /** Called with the transcribed text. */
  onText: (text: string) => void;
  className?: string;
}

type State = 'idle' | 'recording' | 'working';

/** Click to dictate. Runs Whisper on-device: audio never leaves the browser. */
export default function VoiceInputButton({ onText, className = '' }: Props) {
  const [state, setState] = useState<State>('idle');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<MicRecording | null>(null);

  if (!isMicSupported() || !isSpeechToTextSupported()) return null;

  const start = async () => {
    setError(null);
    try {
      rec.current = await startMicRecording();
      setState('recording');
    } catch (e) {
      setError(e instanceof DOMException && e.name === 'NotAllowedError' ? 'Microphone permission denied' : 'Could not access the microphone');
    }
  };

  const stop = async () => {
    if (!rec.current) return;
    setState('working');
    setStatus('Preparing audio...');
    try {
      const blob = await rec.current.stop();
      rec.current = null;
      const audio = await decodeToMono16k(await blob.arrayBuffer());
      const { text } = await transcribe(audio, {
        onProgress: (_pct, stage) => setStatus(stage === 'download' ? 'Downloading speech model (first use only)...' : 'Transcribing...')
      });
      if (text) onText(text);
      else setError('No speech detected');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transcription failed');
    } finally {
      setState('idle');
      setStatus('');
    }
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={state === 'recording' ? stop : start}
        disabled={state === 'working'}
        aria-label={state === 'recording' ? 'Stop recording' : 'Dictate prompt'}
        title="Dictate (on-device, private)"
        className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-colors disabled:opacity-60 ${
          state === 'recording' ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-violet-600 hover:bg-violet-50'
        }`}
      >
        {state === 'working' ? <Loader2 className="w-3 h-3 animate-spin" /> : state === 'recording' ? <Square className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
        {state === 'recording' ? 'Stop' : state === 'working' ? 'Working' : 'Dictate'}
      </button>
      {(status || error) && (
        <span role="status" className={`text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || status}
        </span>
      )}
    </span>
  );
}
