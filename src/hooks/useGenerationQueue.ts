import { useState, useEffect, useCallback, useRef } from 'react';
import { cloudGalleryService, GenerationQueueItem } from '../services/cloudGalleryService';
import { generateImage } from '../services/imageGenerationService';

interface UseGenerationQueueOptions {
  autoProcess?: boolean;
  maxConcurrent?: number;
  maxRetries?: number;
}

export function useGenerationQueue(options: UseGenerationQueueOptions = {}) {
  const { autoProcess = true, maxConcurrent = 1, maxRetries = 3 } = options;
  const [queueItems, setQueueItems] = useState<GenerationQueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [paused, setPaused] = useState(false);
  const processingRef = useRef(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const loadQueue = useCallback(async () => {
    try {
      const items = await cloudGalleryService.getQueueItems();
      setQueueItems(items);
    } catch (err) {
      console.error('Failed to load queue:', err);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const addToQueue = useCallback(async (
    prompt: string,
    tokens: Record<string, string>,
    model: string,
    opts: Record<string, any> = {},
    priority = 0
  ) => {
    try {
      const item = await cloudGalleryService.addToQueue({
        prompt,
        tokens,
        model,
        options: opts,
        priority,
        attempts: 0,
        max_attempts: maxRetries,
        scheduled_at: new Date().toISOString(),
        metadata: {}
      });
      if (item) {
        setQueueItems(prev => [...prev, item]);
      }
      return item;
    } catch (err) {
      console.error('Failed to add to queue:', err);
      return null;
    }
  }, [maxRetries]);

  const cancelItem = useCallback(async (id: string) => {
    const success = await cloudGalleryService.cancelQueueItem(id);
    if (success) {
      setQueueItems(prev => prev.map(item =>
        item.id === id ? { ...item, status: 'cancelled' as const } : item
      ));
    }
  }, []);

  const removeCompleted = useCallback(() => {
    setQueueItems(prev => prev.filter(item =>
      item.status !== 'completed' && item.status !== 'cancelled'
    ));
  }, []);

  const requeue = useCallback(async (id: string) => {
    const success = await cloudGalleryService.updateQueueItem(id, {
      status: 'pending',
      attempts: 0,
      error_message: undefined,
      started_at: undefined,
      completed_at: undefined
    });
    if (success) {
      setQueueItems(prev => prev.map(item =>
        item.id === id ? { ...item, status: 'pending' as const, attempts: 0, error_message: undefined } : item
      ));
    }
  }, []);

  const processNext = useCallback(async () => {
    if (processingRef.current || pausedRef.current) return;

    const pending = queueItems.find(item => item.status === 'pending');
    if (!pending) return;

    processingRef.current = true;
    setProcessing(true);

    await cloudGalleryService.updateQueueItem(pending.id, {
      status: 'processing',
      started_at: new Date().toISOString(),
      attempts: pending.attempts + 1
    });

    setQueueItems(prev => prev.map(item =>
      item.id === pending.id ? { ...item, status: 'processing' as const, started_at: new Date().toISOString() } : item
    ));

    try {
      let resolvedPrompt = pending.prompt;
      if (pending.tokens) {
        Object.entries(pending.tokens).forEach(([key, value]) => {
          resolvedPrompt = resolvedPrompt.replace(new RegExp(`\\[${key}\\]`, 'gi'), value);
        });
      }

      const result = await generateImage(resolvedPrompt, {
        style: pending.style,
        ...pending.options
      });

      await cloudGalleryService.updateQueueItem(pending.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: { ...pending.metadata, imageUrl: result.imageUrl, provider: result.provider }
      });

      setQueueItems(prev => prev.map(item =>
        item.id === pending.id ? {
          ...item,
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
          metadata: { ...item.metadata, imageUrl: result.imageUrl }
        } : item
      ));
    } catch (err: any) {
      const canRetry = pending.attempts + 1 < pending.max_attempts;
      await cloudGalleryService.updateQueueItem(pending.id, {
        status: canRetry ? 'pending' : 'failed',
        error_message: err.message || 'Generation failed',
        attempts: pending.attempts + 1
      });

      setQueueItems(prev => prev.map(item =>
        item.id === pending.id ? {
          ...item,
          status: canRetry ? 'pending' as const : 'failed' as const,
          error_message: err.message || 'Generation failed',
          attempts: pending.attempts + 1
        } : item
      ));
    }

    processingRef.current = false;
    setProcessing(false);
  }, [queueItems]);

  useEffect(() => {
    if (autoProcess && !paused && !processing) {
      const hasPending = queueItems.some(item => item.status === 'pending');
      if (hasPending) {
        const timer = setTimeout(processNext, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [queueItems, autoProcess, paused, processing, processNext]);

  const stats = {
    total: queueItems.length,
    pending: queueItems.filter(i => i.status === 'pending').length,
    processing: queueItems.filter(i => i.status === 'processing').length,
    completed: queueItems.filter(i => i.status === 'completed').length,
    failed: queueItems.filter(i => i.status === 'failed').length,
  };

  return {
    queueItems,
    processing,
    paused,
    stats,
    addToQueue,
    cancelItem,
    removeCompleted,
    requeue,
    processNext,
    setPaused,
    loadQueue,
  };
}
