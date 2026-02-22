import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Search, Star, Download, Heart, Filter, ChevronDown, X,
  Image, Sparkles, Film, Palette, Users, TrendingUp, Eye, Share2, Plus, Check
} from 'lucide-react';

interface MarketplaceTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  preview_url: string;
  author_name: string;
  downloads: number;
  likes: number;
  rating: number;
  tags: string[];
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: Store },
  { id: 'portraits', label: 'Portraits', icon: Users },
  { id: 'products', label: 'Product Shots', icon: Image },
  { id: 'marketing', label: 'Marketing', icon: TrendingUp },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'artistic', label: 'Artistic', icon: Palette },
  { id: 'video', label: 'Video', icon: Film },
];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'newest', label: 'Newest First' },
  { id: 'top-rated', label: 'Top Rated' },
  { id: 'most-downloaded', label: 'Most Downloaded' },
];

const SAMPLE_TEMPLATES: MarketplaceTemplate[] = [
  {
    id: '1', title: 'Professional Headshot', description: 'Clean, modern professional headshot with subtle lighting and neutral background. Perfect for LinkedIn and corporate profiles.',
    category: 'portraits', prompt: 'Professional corporate headshot of [FIRSTNAME] [LASTNAME], [TITLE] at [COMPANY], clean studio lighting, neutral gray background, sharp focus, business attire, confident expression',
    preview_url: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=400',
    author_name: 'StudioPro', downloads: 2847, likes: 891, rating: 4.8, tags: ['headshot', 'professional', 'corporate', 'linkedin'], created_at: '2025-12-15'
  },
  {
    id: '2', title: 'Product Launch Hero', description: 'Dynamic product launch imagery with bold gradients and floating elements. Great for landing pages and email campaigns.',
    category: 'products', prompt: 'Stunning product hero shot for [COMPANY], minimalist white background, dramatic lighting, floating 3D elements, bold gradient accents, professional product photography style',
    preview_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400',
    author_name: 'LaunchDesign', downloads: 1923, likes: 634, rating: 4.7, tags: ['product', 'launch', 'hero', 'marketing'], created_at: '2025-11-28'
  },
  {
    id: '3', title: 'Social Story Banner', description: 'Eye-catching Instagram/TikTok story banner with personalized greetings and trendy design elements.',
    category: 'social', prompt: 'Vibrant social media story banner, "Hello [FIRSTNAME]!" in bold modern typography, trendy gradient from coral to gold, geometric shapes, confetti particles, 9:16 aspect ratio',
    preview_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
    author_name: 'SocialWiz', downloads: 3456, likes: 1102, rating: 4.9, tags: ['social', 'story', 'instagram', 'tiktok'], created_at: '2026-01-05'
  },
  {
    id: '4', title: 'Watercolor Portrait', description: 'Beautiful watercolor-style artistic portrait with soft edges and painterly textures.',
    category: 'artistic', prompt: 'Watercolor portrait painting of a person, soft flowing brushstrokes, delicate color washes, paper texture visible, impressionist style, warm palette',
    preview_url: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=400',
    author_name: 'ArtStudio', downloads: 1567, likes: 823, rating: 4.6, tags: ['watercolor', 'art', 'portrait', 'painting'], created_at: '2025-10-20'
  },
  {
    id: '5', title: 'Email Campaign Header', description: 'Clean, brand-aligned email header with personalization tokens for maximum engagement.',
    category: 'marketing', prompt: 'Professional email campaign header for [COMPANY], featuring "[FIRSTNAME], your exclusive offer awaits" in elegant typography, brand colors, clean layout, call-to-action button, 600px wide',
    preview_url: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400',
    author_name: 'EmailPro', downloads: 4102, likes: 1345, rating: 4.9, tags: ['email', 'campaign', 'header', 'personalized'], created_at: '2026-01-18'
  },
  {
    id: '6', title: 'Event Invitation', description: 'Elegant event invitation with personalized attendee details and RSVP theming.',
    category: 'marketing', prompt: 'Elegant event invitation card, "[FIRSTNAME] [LASTNAME], you are invited to [EVENTNAME]", sophisticated black and gold design, serif typography, ornate border, premium feel',
    preview_url: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
    author_name: 'EventDesign', downloads: 2190, likes: 756, rating: 4.7, tags: ['event', 'invitation', 'elegant', 'personalized'], created_at: '2025-12-01'
  },
  {
    id: '7', title: 'Team Welcome Card', description: 'Warm welcome card for new team members with personalized name and department.',
    category: 'portraits', prompt: 'Warm welcome aboard card for [FIRSTNAME] joining [DEPARTMENT] at [COMPANY], friendly modern design, team collaboration imagery, warm teal and orange palette, confetti accents',
    preview_url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
    author_name: 'HRDesign', downloads: 967, likes: 421, rating: 4.5, tags: ['welcome', 'team', 'onboarding', 'hr'], created_at: '2026-02-01'
  },
  {
    id: '8', title: 'Neon Cyberpunk Scene', description: 'Futuristic cyberpunk-style artwork with neon lighting and urban atmosphere.',
    category: 'artistic', prompt: 'Cyberpunk city scene at night, neon lights in cyan and magenta, rain-slicked streets, holographic billboards, futuristic architecture, moody atmosphere, blade runner inspired',
    preview_url: 'https://images.pexels.com/photos/3052727/pexels-photo-3052727.jpeg?auto=compress&cs=tinysrgb&w=400',
    author_name: 'NeonArt', downloads: 2890, likes: 1567, rating: 4.8, tags: ['cyberpunk', 'neon', 'futuristic', 'art'], created_at: '2026-01-10'
  },
  {
    id: '9', title: 'Loyalty Reward Card', description: 'Personalized loyalty reward card showing member tier and points balance.',
    category: 'marketing', prompt: '[FIRSTNAME] [LASTNAME] - [MEMBERSHIP] Member, [POINTS] points earned at [COMPANY], luxury card design with metallic gold accents, premium feel, membership badge, elegant typography',
    preview_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400',
    author_name: 'LoyaltyPro', downloads: 1345, likes: 589, rating: 4.6, tags: ['loyalty', 'reward', 'membership', 'card'], created_at: '2025-11-15'
  },
];

function TemplateCard({ template, onUse }: { template: MarketplaceTemplate; onUse: (t: MarketplaceTemplate) => void }) {
  const [liked, setLiked] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img src={template.preview_url} alt={template.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button onClick={() => onUse(template)} className="flex-1 px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Use Template
          </button>
          <button onClick={() => setShowPrompt(!showPrompt)} className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
            <Eye className="w-4 h-4 text-gray-700" />
          </button>
        </div>
        <div className="absolute top-3 right-3">
          <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} className={`p-2 rounded-full transition-all ${liked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:text-red-500'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{template.title}</h3>
          <div className="flex items-center gap-1 text-amber-500 shrink-0">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-medium">{template.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{template.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-medium text-gray-600">by {template.author_name}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {template.downloads.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {template.likes.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap mt-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
          {template.tags.length > 3 && <span className="text-xs text-gray-400">+{template.tags.length - 3}</span>}
        </div>
      </div>

      <AnimatePresence>
        {showPrompt && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-100">
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Prompt</span>
                <button onClick={() => navigator.clipboard.writeText(template.prompt)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Copy</button>
              </div>
              <p className="text-sm text-gray-700 font-mono leading-relaxed">{template.prompt}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UseTemplateModal({ template, onClose }: { template: MarketplaceTemplate; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video">
          <img src={template.preview_url} alt={template.title} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{template.title}</h2>
          <p className="text-gray-500 text-sm mb-4">{template.description}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Prompt Template</span>
            <p className="text-sm font-mono text-gray-700 leading-relaxed mt-2">{template.prompt}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCopy} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Plus className="w-4 h-4" /> Copy Prompt</>}
            </button>
            <a href={`/features/modern-ai-image?prompt=${encodeURIComponent(template.prompt)}`} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Sparkles className="w-4 h-4" /> Open in Generator
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = SAMPLE_TEMPLATES
    .filter((t) => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)) || t.prompt.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'top-rated': return b.rating - a.rating;
        case 'most-downloaded': return b.downloads - a.downloads;
        default: return b.likes - a.likes;
      }
    });

  const stats = {
    total: SAMPLE_TEMPLATES.length,
    totalDownloads: SAMPLE_TEMPLATES.reduce((sum, t) => sum + t.downloads, 0),
    avgRating: (SAMPLE_TEMPLATES.reduce((sum, t) => sum + t.rating, 0) / SAMPLE_TEMPLATES.length).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Store className="w-4 h-4" /> Template Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Discover & Share Templates</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Browse community-curated prompt templates, use them in your projects, and share your own creations</p>
          <div className="flex items-center justify-center gap-8 mt-6 text-sm">
            <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.total}</div><div className="text-gray-500">Templates</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.totalDownloads.toLocaleString()}</div><div className="text-gray-500">Downloads</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-gray-900">{stats.avgRating}</div><div className="text-gray-500">Avg Rating</div></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search templates by name, tags, or prompt content..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-3 border rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="relative group">
              <button className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-50">
                <TrendingUp className="w-4 h-4" />
                {SORT_OPTIONS.find((o) => o.id === sortBy)?.label}
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 hidden group-hover:block z-10 min-w-[180px]">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setSortBy(opt.id)} className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortBy === opt.id ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
              <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl border border-gray-100">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      <Icon className="w-4 h-4" />{cat.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No templates found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((template) => (
              <TemplateCard key={template.id} template={template} onUse={setSelectedTemplate} />
            ))}
          </div>
        )}

        <div className="text-center mt-12 text-sm text-gray-400">Showing {filtered.length} of {SAMPLE_TEMPLATES.length} templates</div>
      </div>

      <AnimatePresence>
        {selectedTemplate && <UseTemplateModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />}
      </AnimatePresence>
    </div>
  );
}
