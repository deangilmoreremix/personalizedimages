// Speech synthesis utility functions for the AI assistant
// This module handles text-to-speech and speech-to-text functionality

// Configuration for speech synthesis
interface SpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  onPause?: () => void;
  onResume?: () => void;
}

// Default speech options
const defaultSpeechOptions: SpeechOptions = {
  voice: '', // Will be set to first available voice
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0
};

// State management for speech
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isSpeaking = false;
let isPaused = false;
let speechQueue: { text: string, options?: SpeechOptions }[] = [];
let availableVoices: SpeechSynthesisVoice[] = [];

// Initialize speech synthesis
function initSpeechSynthesis() {
  // Check if speech synthesis is available
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser');
    return false;
  }

  // Get available voices
  const loadVoices = () => {
    availableVoices = window.speechSynthesis.getVoices();
    
    // Set default voice to a natural sounding one if available
    if (availableVoices.length > 0) {
      // Try to find a good default voice (prefer natural sounding voices)
      const preferredVoices = [
        'Google UK English Female',
        'Microsoft Zira Desktop',
        'Samantha',
        'Google US English',
        'Microsoft David Desktop'
      ];
      
      for (const voiceName of preferredVoices) {
        const voice = availableVoices.find(v => v.name === voiceName);
        if (voice) {
          defaultSpeechOptions.voice = voice.name;
          break;
        }
      }
      
      // If no preferred voice found, use the first available voice
      if (!defaultSpeechOptions.voice && availableVoices.length > 0) {
        defaultSpeechOptions.voice = availableVoices[0].name;
      }
    }
  };

  // Load voices immediately if available
  loadVoices();
  
  // Chrome loads voices asynchronously, so we need to wait for them
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  return true;
}

// Speak text using speech synthesis
function speak(text: string, options?: SpeechOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported in this browser');
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // If already speaking, add to queue
    if (isSpeaking && !isPaused) {
      speechQueue.push({ text, options });
      return;
    }

    // Merge options with defaults
    const mergedOptions = { ...defaultSpeechOptions, ...options };

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if specified
    if (mergedOptions.voice) {
      const voice = availableVoices.find(v => v.name === mergedOptions.voice);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    // Set other properties
    utterance.rate = mergedOptions.rate || 1;
    utterance.pitch = mergedOptions.pitch || 1;
    utterance.volume = mergedOptions.volume || 1;

    // Set event handlers
    utterance.onstart = () => {
      isSpeaking = true;
      if (mergedOptions.onStart) mergedOptions.onStart();
    };

    utterance.onend = () => {
      isSpeaking = false;
      currentUtterance = null;
      
      if (mergedOptions.onEnd) mergedOptions.onEnd();
      
      // Process next item in queue if any
      if (speechQueue.length > 0) {
        const nextItem = speechQueue.shift();
        if (nextItem) {
          speak(nextItem.text, nextItem.options)
            .then(resolve)
            .catch(reject);
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    };

    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event);
      
      // Don't treat canceled or interrupted errors as fatal
      if (event.error === 'canceled' || event.error === 'interrupted') {
        console.log(`Speech synthesis ${event.error}, continuing normally`);
        
        // Still consider this "done" for the purpose of the queue
        isSpeaking = false;
        currentUtterance = null;
        
        // Process next item in queue if any
        if (speechQueue.length > 0) {
          const nextItem = speechQueue.shift();
          if (nextItem) {
            speak(nextItem.text, nextItem.options)
              .then(resolve)
              .catch(reject);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      } else {
        // For other errors, call the error handler and reject the promise
        if (mergedOptions.onError) mergedOptions.onError(event);
        isSpeaking = false;
        currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      }
    };

    utterance.onpause = () => {
      isPaused = true;
      if (mergedOptions.onPause) mergedOptions.onPause();
    };

    utterance.onresume = () => {
      isPaused = false;
      if (mergedOptions.onResume) mergedOptions.onResume();
    };

    // Store current utterance
    currentUtterance = utterance;

    // Speak
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      reject(error);
    }
  });
}

// Stop speaking
function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    isPaused = false;
    currentUtterance = null;
    speechQueue = [];
  }
}

// Pause speaking
function pauseSpeaking() {
  if ('speechSynthesis' in window && isSpeaking && !isPaused) {
    window.speechSynthesis.pause();
    isPaused = true;
  }
}

// Resume speaking
function resumeSpeaking() {
  if ('speechSynthesis' in window && isSpeaking && isPaused) {
    window.speechSynthesis.resume();
    isPaused = false;
  }
}

// Check if speech synthesis is speaking
function isSpeechSynthesisSpeaking() {
  if ('speechSynthesis' in window) {
    return isSpeaking;
  }
  return false;
}

// Check if speech synthesis is paused
function isSpeechSynthesisPaused() {
  if ('speechSynthesis' in window) {
    return isPaused;
  }
  return false;
}

// Get available voices
function getAvailableVoices(): SpeechSynthesisVoice[] {
  if ('speechSynthesis' in window) {
    return availableVoices;
  }
  return [];
}

// Speech recognition functionality
let recognition: SpeechRecognition | null = null;
let isListening = false;

// Initialize speech recognition
function initSpeechRecognition() {
  // Check if speech recognition is available
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Speech recognition is not supported in this browser');
    return false;
  }
  
  // Create recognition instance
  recognition = new SpeechRecognition();
  
  // Configure recognition
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  return true;
}

// Start listening for speech
function startListening(options: {
  onResult?: (text: string) => void,
  onError?: (error: any) => void,
  onEnd?: () => void
} = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!recognition) {
      const initialized = initSpeechRecognition();
      if (!initialized) {
        reject(new Error('Speech recognition not supported'));
        return;
      }
    }
    
    if (isListening) {
      stopListening();
    }
    
    // Set up event handlers
    recognition!.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      
      if (options.onResult) {
        options.onResult(text);
      }
      
      resolve();
    };
    
    recognition!.onerror = (event) => {
      console.warn('Speech recognition error:', event);
      isListening = false;
      
      if (options.onError) {
        options.onError(event);
      }
      
      reject(new Error(`Speech recognition error: ${event.error}`));
    };
    
    recognition!.onend = () => {
      isListening = false;
      
      if (options.onEnd) {
        options.onEnd();
      }
    };
    
    // Start listening
    try {
      recognition!.start();
      isListening = true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      reject(error);
    }
  });
}

// Stop listening
function stopListening() {
  if (recognition && isListening) {
    recognition.stop();
    isListening = false;
  }
}

// Check if speech recognition is listening
function isSpeechRecognitionListening() {
  return isListening;
}

// Utility function to check browser support
function checkSpeechSupport() {
  const speechSynthesisSupported = 'speechSynthesis' in window;
  const speechRecognitionSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  
  return {
    synthesis: speechSynthesisSupported,
    recognition: speechRecognitionSupported
  };
}

// Speech Recognition Service class
export class SpeechRecognitionService {
  private onResultCallback?: (text: string) => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: any) => void;
  
  constructor(
    onResult?: (text: string) => void,
    onEnd?: () => void,
    onError?: (error: any) => void
  ) {
    this.onResultCallback = onResult;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;
    
    // Initialize recognition on construction
    initSpeechRecognition();
  }
  
  public start(): boolean {
    try {
      startListening({
        onResult: (text) => {
          if (this.onResultCallback) this.onResultCallback(text);
        },
        onEnd: () => {
          if (this.onEndCallback) this.onEndCallback();
        },
        onError: (error) => {
          if (this.onErrorCallback) this.onErrorCallback(error);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }
  
  public stop(): void {
    stopListening();
  }
  
  public isListening(): boolean {
    return isSpeechRecognitionListening();
  }
}

// Speech Synthesis Service class
export class SpeechSynthesisService {
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: any) => void;
  
  constructor(
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: any) => void
  ) {
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;
    
    // Initialize synthesis on construction
    initSpeechSynthesis();
  }
  
  public speak(text: string, options?: Omit<SpeechOptions, 'onStart' | 'onEnd' | 'onError'>): Promise<void> {
    return speak(text, {
      ...options,
      onStart: this.onStartCallback,
      onEnd: this.onEndCallback,
      onError: this.onErrorCallback
    });
  }
  
  public stop(): void {
    stopSpeaking();
  }
  
  public pause(): void {
    pauseSpeaking();
  }
  
  public resume(): void {
    resumeSpeaking();
  }
  
  public isSpeaking(): boolean {
    return isSpeechSynthesisSpeaking();
  }
  
  public isPaused(): boolean {
    return isSpeechSynthesisPaused();
  }
  
  public getVoices(): SpeechSynthesisVoice[] {
    return getAvailableVoices();
  }
}

// Utility function to prepare text for speech
export function prepareSpokenResponse(text: string): string {
  // Remove Markdown-style formatting
  let cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/__(.*?)__/g, '$1')     // Underline
    .replace(/~~(.*?)~~/g, '$1')     // Strikethrough
    .replace(/```([\s\S]*?)```/g, '') // Code blocks
    .replace(/`(.*?)`/g, '$1')       // Inline code
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Links
    .replace(/#{1,6}\s+(.*?)$/gm, '$1') // Headers
    .replace(/\n\s*[-*+]\s+/g, '. ') // List items
    .replace(/\n\s*\d+\.\s+/g, '. '); // Numbered list items

  // Replace multiple newlines with a pause
  cleanText = cleanText.replace(/\n{2,}/g, '. ');
  
  // Replace remaining newlines with a shorter pause
  cleanText = cleanText.replace(/\n/g, ', ');
  
  // Simplify multiple spaces
  cleanText = cleanText.replace(/\s+/g, ' ');
  
  // Add appropriate pauses for punctuation
  cleanText = cleanText
    .replace(/\.\s+/g, '. ')
    .replace(/!\s+/g, '! ')
    .replace(/\?\s+/g, '? ');
  
  return cleanText.trim();
}