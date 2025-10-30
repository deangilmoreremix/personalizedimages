import { createClient } from '@supabase/supabase-js';
import { actionFigureTemplates } from './src/data/actionFigureTemplates.ts';
import { wrestlingActionFigurePrompts } from './src/data/wrestlingActionFigures.ts';
import { musicStarActionFigurePrompts } from './src/data/musicStarActionFigures.ts';
import { retroActionFigurePrompts } from './src/data/retroActionFigures.ts';
import { tvShowActionFigurePrompts } from './src/data/tvShowActionFigures.ts';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedActionFigures() {
  console.log('🎭 Seeding action figure templates...');

  const allTemplates = [
    ...actionFigureTemplates.map(t => ({ ...t, category: 'general' })),
    ...wrestlingActionFigurePrompts.map(t => ({ ...t, category: 'wrestling' })),
    ...musicStarActionFigurePrompts.map(t => ({ ...t, category: 'music' })),
    ...retroActionFigurePrompts.map(t => ({ ...t, category: 'retro' })),
    ...tvShowActionFigurePrompts.map(t => ({ ...t, category: 'tv' }))
  ];

  for (const template of allTemplates) {
    const data = {
      template_id: template.id || template.name.toLowerCase().replace(/\s+/g, '-'),
      name: template.name || template.title,
      description: template.description,
      prompt: template.prompt,
      packaging: template.packaging || template.packagingStyle || 'Standard',
      accessories: JSON.stringify(template.accessories || []),
      style: template.style || 'classic',
      preview: template.preview || template.previewImage || null,
      category: template.category,
      is_active: true
    };

    const { error } = await supabase
      .from('action_figure_templates')
      .upsert(data, { onConflict: 'template_id' });

    if (error) {
      console.error(`Error seeding template ${data.template_id}:`, error.message);
    } else {
      console.log(`✅ Seeded: ${data.name}`);
    }
  }

  console.log(`✅ Seeded ${allTemplates.length} action figure templates`);
}

async function seedMemeTemplates() {
  console.log('😄 Seeding meme templates...');

  const memeTemplates = [
    {
      template_id: 'distracted-boyfriend',
      name: 'Distracted Boyfriend',
      url: 'https://i.imgflip.com/1ur9b0.jpg',
      category: 'Classic',
      description: 'Man looking at another woman while his girlfriend looks disapproving',
      is_active: true
    },
    {
      template_id: 'drake-hotline',
      name: 'Drake Hotline Bling',
      url: 'https://i.imgflip.com/30b1gx.jpg',
      category: 'Classic',
      description: 'Drake disapproving and approving',
      is_active: true
    },
    {
      template_id: 'two-buttons',
      name: 'Two Buttons',
      url: 'https://i.imgflip.com/1g8my4.jpg',
      category: 'Classic',
      description: 'Person sweating choosing between two buttons',
      is_active: true
    },
    {
      template_id: 'expanding-brain',
      name: 'Expanding Brain',
      url: 'https://i.imgflip.com/1jwhww.jpg',
      category: 'Classic',
      description: 'Four levels of increasingly enlightened thinking',
      is_active: true
    },
    {
      template_id: 'change-my-mind',
      name: 'Change My Mind',
      url: 'https://i.imgflip.com/24y43o.jpg',
      category: 'Opinion',
      description: 'Person sitting at table with sign',
      is_active: true
    }
  ];

  for (const template of memeTemplates) {
    const { error } = await supabase
      .from('meme_templates')
      .upsert(template, { onConflict: 'template_id' });

    if (error) {
      console.error(`Error seeding meme ${template.template_id}:`, error.message);
    } else {
      console.log(`✅ Seeded: ${template.name}`);
    }
  }

  console.log(`✅ Seeded ${memeTemplates.length} meme templates`);
}

async function seedCartoonThemes() {
  console.log('🎨 Seeding cartoon themes...');

  const themes = [
    {
      theme_id: 'classic-disney',
      name: 'Classic Disney',
      description: 'Traditional Disney animation style with expressive characters',
      style_keywords: 'Disney animation style, expressive eyes, smooth lines, vibrant colors',
      is_active: true
    },
    {
      theme_id: 'anime',
      name: 'Anime',
      description: 'Japanese anime style with detailed features',
      style_keywords: 'anime style, manga art, detailed eyes, dynamic poses',
      is_active: true
    },
    {
      theme_id: 'pixar-3d',
      name: 'Pixar 3D',
      description: '3D animated style like Pixar movies',
      style_keywords: 'Pixar 3D style, smooth rendering, realistic lighting, cartoon proportions',
      is_active: true
    },
    {
      theme_id: 'comic-book',
      name: 'Comic Book',
      description: 'Bold comic book art style',
      style_keywords: 'comic book art, bold outlines, halftone dots, pop art colors',
      is_active: true
    },
    {
      theme_id: 'south-park',
      name: 'South Park',
      description: 'Simple cutout animation style',
      style_keywords: 'South Park style, simple shapes, cutout animation, minimal details',
      is_active: true
    }
  ];

  for (const theme of themes) {
    const { error } = await supabase
      .from('cartoon_themes')
      .upsert(theme, { onConflict: 'theme_id' });

    if (error) {
      console.error(`Error seeding theme ${theme.theme_id}:`, error.message);
    } else {
      console.log(`✅ Seeded: ${theme.name}`);
    }
  }

  console.log(`✅ Seeded ${themes.length} cartoon themes`);
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    await seedActionFigures();
    console.log('');
    await seedMemeTemplates();
    console.log('');
    await seedCartoonThemes();
    console.log('\n✨ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
