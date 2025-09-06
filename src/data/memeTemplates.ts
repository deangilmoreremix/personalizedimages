// Meme Generator Configuration
// Configuration for meme templates and generation

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  topText?: string;
  bottomText?: string;
}

interface MemeCategory {
  name: string;
  description: string;
  templates: MemeTemplate[];
}

interface QuickTextTemplate {
  id: string;
  name: string;
  topText: string;
  bottomText: string;
  description: string;
}

export interface MemeConfig {
  categories: MemeCategory[];
  quickTemplates: QuickTextTemplate[];
  ui: {
    enableCategories: boolean;
    enableQuickTemplates: boolean;
    enableCustomTemplates: boolean;
    maxTemplatesPerCategory: number;
    enableTextStyling: boolean;
    enableAIEnhancement: boolean;
  };
}

export const memeConfig: MemeConfig = {
  categories: [
    {
      name: "Classic Memes",
      description: "Timeless meme templates that never go out of style",
      templates: [
        {
          id: "distracted-boyfriend",
          name: "Distracted Boyfriend",
          url: "https://i.imgflip.com/1ur9b0.jpg",
          category: "classic",
          description: "The boyfriend looking back at another woman while his girlfriend looks shocked",
          topText: "Me seeing a new meme template",
          bottomText: "My current favorite meme"
        },
        {
          id: "two-buttons",
          name: "Two Buttons",
          url: "https://i.imgflip.com/1g8my4.jpg",
          category: "classic",
          description: "A person choosing between two options represented by buttons",
          topText: "Use this meme",
          bottomText: "Use that meme"
        },
        {
          id: "drake",
          name: "Drake Hotline Bling",
          url: "https://i.imgflip.com/30b1gx.jpg",
          category: "classic",
          description: "Drake rejecting something above and approving something below",
          topText: "Things I don't like",
          bottomText: "Things I do like"
        },
        {
          id: "change-my-mind",
          name: "Change My Mind",
          url: "https://i.imgflip.com/24y43o.jpg",
          category: "classic",
          description: "Guy at a table with a sign saying 'Change my mind'",
          topText: "",
          bottomText: "Change my mind"
        }
      ]
    },
    {
      name: "Reaction Memes",
      description: "Perfect for expressing reactions to situations",
      templates: [
        {
          id: "expanding-brain",
          name: "Expanding Brain",
          url: "https://i.imgflip.com/1jwhww.jpg",
          category: "reaction",
          description: "Four panels showing brains getting progressively larger",
          topText: "Small brain",
          bottomText: "Galaxy brain"
        },
        {
          id: "balloon",
          name: "Running Away Balloon",
          url: "https://i.imgflip.com/261o3j.jpg",
          category: "reaction",
          description: "A balloon running away from something scary",
          topText: "Me trying to avoid responsibilities",
          bottomText: ""
        },
        {
          id: "pikachu",
          name: "Surprised Pikachu",
          url: "https://i.imgflip.com/2kbn1e.jpg",
          category: "reaction",
          description: "Pikachu looking shocked and surprised",
          topText: "What I expected",
          bottomText: "What I got"
        },
        {
          id: "woman-cat",
          name: "Woman Yelling At Cat",
          url: "https://i.imgflip.com/345v97.jpg",
          category: "reaction",
          description: "Woman yelling and a cat looking smug",
          topText: "Me explaining something simple",
          bottomText: "People who don't understand"
        }
      ]
    },
    {
      name: "Text-Based Memes",
      description: "Memes that rely heavily on text and typography",
      templates: [
        {
          id: "one-does-not-simply",
          name: "One Does Not Simply",
          url: "https://i.imgflip.com/1bij.jpg",
          category: "text",
          description: "Boromir saying 'One does not simply walk into Mordor'",
          topText: "One does not simply",
          bottomText: "Make a good meme"
        },
        {
          id: "doge",
          name: "Buff Doge vs. Cheems",
          url: "https://i.imgflip.com/43a45p.png",
          category: "text",
          description: "Doge and Cheems in different situations",
          topText: "Buff Doge",
          bottomText: "Cheems"
        },
        {
          id: "handshake",
          name: "Epic Handshake",
          url: "https://i.imgflip.com/28j0te.jpg",
          category: "text",
          description: "Two people having an epic handshake",
          topText: "Expectation",
          bottomText: "Reality"
        },
        {
          id: "always-has-been",
          name: "Always Has Been",
          url: "https://i.imgflip.com/43jiyu.jpg",
          category: "text",
          description: "Wayne from Letterkenny saying 'Always has been'",
          topText: "Something that",
          bottomText: "Always has been"
        }
      ]
    }
  ],

  quickTemplates: [
    {
      id: "success",
      name: "Success Story",
      topText: "When [FIRSTNAME] finally",
      bottomText: "Gets that promotion",
      description: "Celebrate achievements and successes"
    },
    {
      id: "birthday",
      name: "Birthday Wishes",
      topText: "Happy Birthday",
      bottomText: "[FIRSTNAME]!",
      description: "Personalized birthday meme"
    },
    {
      id: "welcome",
      name: "Welcome Message",
      topText: "Welcome to the team",
      bottomText: "[FIRSTNAME] from [COMPANY]",
      description: "Welcome new team members"
    },
    {
      id: "motivational",
      name: "Motivational",
      topText: "When people say you can't",
      bottomText: "[FIRSTNAME] knows YOU CAN!",
      description: "Motivational and encouraging"
    },
    {
      id: "work-life",
      name: "Work vs Life",
      topText: "Me at work",
      bottomText: "Me after work",
      description: "Work-life balance humor"
    },
    {
      id: "monday",
      name: "Monday Blues",
      topText: "Me on Sunday",
      bottomText: "Me on Monday morning",
      description: "Monday motivation"
    }
  ],

  ui: {
    enableCategories: true,
    enableQuickTemplates: true,
    enableCustomTemplates: true,
    maxTemplatesPerCategory: 8,
    enableTextStyling: true,
    enableAIEnhancement: true
  }
};

// Helper functions
export function getAllTemplates(): MemeTemplate[] {
  return memeConfig.categories.flatMap(category => category.templates);
}

export function getTemplatesByCategory(categoryName: string): MemeTemplate[] {
  const category = memeConfig.categories.find(cat => cat.name === categoryName);
  return category ? category.templates : [];
}

export function getRandomTemplate(): MemeTemplate {
  const allTemplates = getAllTemplates();
  return allTemplates[Math.floor(Math.random() * allTemplates.length)];
}

export function getQuickTemplate(id: string): QuickTextTemplate | undefined {
  return memeConfig.quickTemplates.find(template => template.id === id);
}

export default memeConfig;