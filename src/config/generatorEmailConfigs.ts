/**
 * Generator-specific email personalization configurations
 * Defines supported tokens, default templates, and recommendations for each image generator
 */

export type GeneratorType =
  | 'gif'
  | 'action-figure'
  | 'music-star'
  | 'tv-show'
  | 'wrestling'
  | 'meme'
  | 'ghibli'
  | 'cartoon'
  | 'ai-image';

export interface GeneratorEmailConfig {
  supportedTokens: string[];
  defaultTemplate: 'centered' | 'leftAligned' | 'announcement';
  recommendedTokens: string[];
  description: string;
  templateDescription: string;
}

export const generatorEmailConfigs: Record<GeneratorType, GeneratorEmailConfig> = {
  gif: {
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'COMPANY', 'EVENT'],
    defaultTemplate: 'announcement',
    recommendedTokens: ['FIRSTNAME', 'COMPANY'],
    description: 'Animated GIF for email campaigns',
    templateDescription: 'Perfect for attention-grabbing announcements and promotions'
  },
  'action-figure': {
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'CHARACTER_NAME', 'COLLECTION'],
    defaultTemplate: 'centered',
    recommendedTokens: ['FIRSTNAME', 'CHARACTER_NAME'],
    description: 'Custom action figure for collectors',
    templateDescription: 'Showcase your action figure with professional presentation'
  },
  'music-star': {
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'ARTIST_NAME', 'GENRE', 'VENUE'],
    defaultTemplate: 'centered',
    recommendedTokens: ['FIRSTNAME', 'ARTIST_NAME'],
    description: 'Music star action figure for fans',
    templateDescription: 'Celebrate music legends with personalized collectibles'
  },
  'tv-show': {
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'CHARACTER_NAME', 'SHOW_NAME', 'SEASON'],
    defaultTemplate: 'centered',
    recommendedTokens: ['FIRSTNAME', 'CHARACTER_NAME', 'SHOW_NAME'],
    description: 'TV show character action figure',
    templateDescription: 'Bring your favorite TV characters to life'
  },
  wrestling: {
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'WRESTLER_NAME', 'PROMOTION', 'TITLE'],
    defaultTemplate: 'centered',
    recommendedTokens: ['FIRSTNAME', 'WRESTLER_NAME'],
    description: 'Wrestling legend action figure',
    templateDescription: 'Create championship-worthy collectibles'
  },
  meme: {
    supportedTokens: ['FIRSTNAME', 'USERNAME', 'HASHTAG'],
    defaultTemplate: 'centered',
    recommendedTokens: ['FIRSTNAME', 'USERNAME'],
    description: 'Personalized meme for social sharing',
    templateDescription: 'Turn memes into shareable email content'
  },
  ghibli: {
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'CHARACTER_NAME', 'MOVIE_TITLE'],
    defaultTemplate: 'announcement',
    recommendedTokens: ['FIRSTNAME', 'CHARACTER_NAME'],
    description: 'Magical Ghibli-inspired artwork',
    templateDescription: 'Share the magic of Studio Ghibli in beautiful emails'
  },
  cartoon: {
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'CHARACTER_NAME', 'STYLE'],
    defaultTemplate: 'centered',
    recommendedTokens: ['FIRSTNAME', 'CHARACTER_NAME'],
    description: 'Fun cartoon-style artwork',
    templateDescription: 'Add cartoon charm to your email campaigns'
  },
  'ai-image': {
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'COMPANY', 'PROJECT'],
    defaultTemplate: 'centered',
    recommendedTokens: ['FIRSTNAME', 'COMPANY'],
    description: 'AI-generated artwork',
    templateDescription: 'Showcase AI creativity in professional emails'
  }
};

/**
 * Get email config for a specific generator
 */
export const getGeneratorEmailConfig = (generatorType: GeneratorType): GeneratorEmailConfig => {
  return generatorEmailConfigs[generatorType] || generatorEmailConfigs['ai-image'];
};

/**
 * Get recommended tokens for a generator with current values
 */
export const getRecommendedTokens = (
  generatorType: GeneratorType,
  availableTokens: Record<string, string>
): Record<string, string> => {
  const config = getGeneratorEmailConfig(generatorType);
  const recommended: Record<string, string> = {};

  config.recommendedTokens.forEach(token => {
    if (availableTokens[token]) {
      recommended[token] = availableTokens[token];
    }
  });

  return recommended;
};