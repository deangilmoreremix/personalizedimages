import OpenAI from 'openai';

interface OpenAIAssistantOptions {
  messages: Array<{ role: string; content: string }>;
  userData: Record<string, string>;
  onUpdate?: (text: string) => void;
}

interface OpenAIAssistantResponse {
  content: string;
  suggestedFeatures: string[];
}

/**
 * Creates and returns an OpenAI assistant instance
 */
export async function createOpenAIAssistant() {
  // Initialize the OpenAI client
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Make sure VITE_OPENAI_API_KEY is set in your environment variables.');
  }
  
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: In production, you should use a backend proxy
  });
  
  /**
   * Process messages with the OpenAI assistant
   */
  const process = async ({
    messages,
    userData,
    onUpdate
  }: OpenAIAssistantOptions): Promise<OpenAIAssistantResponse> => {
    try {
      // Create a system message with information about features and the user
      const systemMessage = `You are an AI assistant for a creative tool called VideoRemix that helps users create personalized images, action figures, Ghibli-style images, cartoon-style images, memes, and other visual content using AI. 
      
First name: ${userData['FIRSTNAME'] || 'User'}
Last name: ${userData['LASTNAME'] || 'Unknown'}
Company: ${userData['COMPANY'] || 'Unknown'}

The available features are:
- Personalized AI Image Generator (image): Create custom images from text descriptions
- Personalized Action Figure Generator (action-figure): Create personalized action figures
- Personalized Studio Ghibli Style (ghibli): Create images in the style of Studio Ghibli
- Personalized Cartoon Style (cartoon): Transform images into cartoon styles
- Personalized Meme Generator (meme): Create personalized memes
- Personalized Crazy Image Generator (crazy): Create wild, surreal images
- Personalized GIF Editor (gif): Create animated GIFs with personalization
- Personalized Email-Ready Image Editor (email): Design images optimized for email

When suggesting features, include the feature ID in brackets like [image] at the end of your response like this: "You might want to try our Personalized AI Image Generator [image]"

First provide a helpful, conversational response, then recommend 1-3 relevant features when appropriate.
IMPORTANT: Keep responses concise (max 3-4 sentences).
At the end of your response include a marker with feature IDs like this: FEATURES:["image","action-figure"]`;

      // Format messages for the OpenAI API
      const formattedMessages = [
        { role: 'system', content: systemMessage },
        ...messages
      ];

      // Create a streaming completion
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 800,
      });

      let fullResponse = '';
      let suggestedFeatures: string[] = [];

      // Process the stream
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onUpdate?.(fullResponse);
        }
      }

      // Extract suggested features
      const featuresMatch = fullResponse.match(/FEATURES:\[(.*?)\]/);
      if (featuresMatch && featuresMatch[1]) {
        try {
          const featuresStr = `[${featuresMatch[1]}]`;
          suggestedFeatures = JSON.parse(featuresStr);
        } catch (e) {
          console.error('Failed to parse feature suggestions:', e);
        }

        // Remove the features marker from the response
        fullResponse = fullResponse.replace(/FEATURES:\[(.*?)\]/g, '').trim();
      }

      // If no explicit feature suggestions were found, try to infer them from content
      if (suggestedFeatures.length === 0) {
        const featureIds = ['image', 'action-figure', 'ghibli', 'meme', 'cartoon', 'crazy', 'gif', 'email'];
        
        featureIds.forEach(id => {
          // Look for feature IDs in brackets, like [image]
          const regex = new RegExp(`\\[${id}\\]`, 'g');
          if (regex.test(fullResponse)) {
            suggestedFeatures.push(id);
          }
        });
      }

      return {
        content: fullResponse,
        suggestedFeatures
      };
    } catch (error) {
      console.error('Error using OpenAI assistant:', error);
      return {
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        suggestedFeatures: []
      };
    }
  };

  return {
    process
  };
}