import React, { useState, useEffect } from 'react';
import { Wand2, Image as ImageIcon, Download, RefreshCw, Zap, Camera, Layers, Sparkles, SlidersHorizontal, Lightbulb, Dices, Upload, Box, Tv } from 'lucide-react';
import { generateActionFigure } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import tvPrompts from '../data/tvShowActionFigures';
import ReferenceImageUploader from './ReferenceImageUploader';

interface TVShowActionFigureGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const TVShowActionFigureGenerator: React.FC<TVShowActionFigureGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedFigure, setGeneratedFigure] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('gemini');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedAdditions, setSelectedAdditions] = useState<string[]>([]);
  const [selectedRemovals, setSelectedRemovals] = useState<string[]>([]);
  const [selectedPose, setSelectedPose] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [showAllCharacters, setShowAllCharacters] = useState(false);

  // Initialize with first prompt
  useEffect(() => {
    if (tvPrompts.length > 0) {
      setSelectedPrompt(0);
      setSelectedPose(tvPrompts[0].poses[0] || '');
    }
  }, []);

  const getCurrentPrompt = () => {
    return tvPrompts[selectedPrompt] || tvPrompts[0];
  };

  const generateCompletePrompt = () => {
    const currentPrompt = getCurrentPrompt();
    
    // Start with the base prompt
    let finalPrompt = currentPrompt.basePrompt;
    
    // Add selected additions
    if (selectedAdditions.length > 0) {
      finalPrompt += ` Additional accessories include: ${selectedAdditions.join(', ')}.`;
    }
    
    // Add removals
    if (selectedRemovals.length > 0) {
      finalPrompt += ` Remove these elements: ${selectedRemovals.join(', ')}.`;
    }
    
    // Add selected pose
    if (selectedPose) {
      finalPrompt += ` The figure is posed in a ${selectedPose} position.`;
    }
    
    // Add packaging details
    finalPrompt += ` The packaging is ${currentPrompt.packaging}.`;
    
    // Add any custom prompt additions
    if (customPrompt) {
      finalPrompt += ` ${customPrompt}`;
    }
    
    // Add personalization if FIRSTNAME token is available
    if (tokens['FIRSTNAME']) {
      finalPrompt += ` The action figure has a personalized name tag for ${tokens['FIRSTNAME']}.`;
    }
    
    finalPrompt += " Create a professional product photo of this TV show action figure toy with studio lighting, high detail, and authentic toy packaging design.";