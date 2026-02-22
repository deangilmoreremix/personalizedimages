import React, { useState, useCallback } from 'react';
import { Sparkles, Copy, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { freepikAiService } from '../../services/freepikAiService';

export default function PromptImprover() {
  const [prompt, setPrompt] = useState('');
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImprove = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await freepikAiService.improvePrompt(prompt.trim());
      setImprovedPrompt(result.improvedPrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to improve prompt');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const handleCopy = useCallback(async () => {
    if (!improvedPrompt) return;
    try {
      await navigator.clipboard.writeText(improvedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [improvedPrompt]);

  const handleUseImproved = useCallback(() => {
    if (improvedPrompt) {
      setPrompt(improvedPrompt);
      setImprovedPrompt('');
    }
  }, [improvedPrompt]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Prompt Improver</h3>
            <p className="text-sm text-gray-500">AI-enhanced prompts for better results</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">Your Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a basic prompt and let AI enhance it..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
          />
        </div>

        <button
          onClick={handleImprove}
          disabled={loading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Improving...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Improve Prompt
            </>
          )}
        </button>

        {improvedPrompt && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Enhanced Prompt</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{improvedPrompt}</p>
            </div>
            <button
              onClick={handleUseImproved}
              className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Use as new prompt and improve again
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={handleImprove}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
