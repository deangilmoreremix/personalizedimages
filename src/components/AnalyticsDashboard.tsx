import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  Image as ImageIcon,
  Users,
  Zap,
  Download,
  RefreshCw,
  Award,
  Activity
} from 'lucide-react';
import { cloudGalleryService } from '../services/cloudGalleryService';
import { supabase } from '../utils/supabaseClient';

interface AnalyticsData {
  totalImages: number;
  totalCost: number;
  avgGenerationTime: number;
  modelUsage: Record<string, number>;
  dailyStats: Array<{
    date: string;
    images: number;
    cost: number;
    avgTime: number;
  }>;
  topPrompts: Array<{
    prompt: string;
    useCount: number;
    avgRating: number;
  }>;
  activeGenerations: number;
  creditsUsed: number;
}

async function fetchRealAnalytics(startDate: string): Promise<AnalyticsData> {
  const sb = supabase as any;
  const { data: userData } = await sb?.auth?.getUser?.() ?? { data: { user: null } };
  const userId = userData?.user?.id;

  const defaults: AnalyticsData = {
    totalImages: 0,
    totalCost: 0,
    avgGenerationTime: 0,
    modelUsage: {},
    dailyStats: [],
    topPrompts: [],
    activeGenerations: 0,
    creditsUsed: 0,
  };

  if (!sb || !userId) return defaults;

  const [imagesRes, eventsRes, promptsRes, queueRes, creditsRes] = await Promise.all([
    sb.from('generated_images').select('id, provider, model, created_at, tokens_used').eq('user_id', userId).gte('created_at', startDate),
    cloudGalleryService.getAnalytics({ startDate, limit: 5000 }),
    cloudGalleryService.getMostUsedPrompts(10),
    sb.from('generation_queue').select('id, status').eq('user_id', userId).in('status', ['pending', 'processing']),
    sb.from('user_credits').select('total_used').eq('user_id', userId).maybeSingle(),
  ]);

  const images = imagesRes?.data || [];
  const events = eventsRes || [];
  const prompts = promptsRes || [];
  const activeQueue = queueRes?.data || [];
  const credits = creditsRes?.data;

  const modelCounts: Record<string, number> = {};
  images.forEach((img: any) => {
    const m = img.provider || img.model || 'unknown';
    modelCounts[m] = (modelCounts[m] || 0) + 1;
  });

  const total = images.length || 1;
  const modelUsage: Record<string, number> = {};
  Object.entries(modelCounts).forEach(([model, count]) => {
    modelUsage[model] = Math.round((count / total) * 100);
  });

  const dailyMap: Record<string, { images: number; cost: number; totalTime: number; count: number }> = {};
  images.forEach((img: any) => {
    const day = img.created_at?.split('T')[0];
    if (!day) return;
    if (!dailyMap[day]) dailyMap[day] = { images: 0, cost: 0, totalTime: 0, count: 0 };
    dailyMap[day].images += 1;
    dailyMap[day].cost += 0.04;
    dailyMap[day].count += 1;
  });

  events.forEach((evt: any) => {
    const day = evt.created_at?.split('T')[0];
    if (!day || !dailyMap[day]) return;
    if (evt.event_data?.generation_time_ms) {
      dailyMap[day].totalTime += evt.event_data.generation_time_ms;
    }
  });

  const dailyStats = Object.entries(dailyMap)
    .map(([date, stats]) => ({
      date,
      images: stats.images,
      cost: Math.round(stats.cost * 100) / 100,
      avgTime: stats.count > 0 ? Math.round(stats.totalTime / stats.count) : 3000,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalCost = images.length * 0.04;

  let totalTime = 0;
  let timeCount = 0;
  events.forEach((evt: any) => {
    if (evt.event_data?.generation_time_ms) {
      totalTime += evt.event_data.generation_time_ms;
      timeCount += 1;
    }
  });

  const topPrompts = prompts.map((p: any) => ({
    prompt: p.prompt,
    useCount: p.use_count || 1,
    avgRating: p.avg_rating || 0,
  }));

  return {
    totalImages: images.length,
    totalCost: Math.round(totalCost * 100) / 100,
    avgGenerationTime: timeCount > 0 ? Math.round(totalTime / timeCount) : 3200,
    modelUsage,
    dailyStats,
    topPrompts,
    activeGenerations: activeQueue.length,
    creditsUsed: credits?.total_used || 0,
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'images' | 'cost' | 'time'>('images');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const getStartDate = () => {
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    now.setDate(now.getDate() - days);
    return now.toISOString();
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchRealAnalytics(getStartDate());
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

  const handleExport = () => {
    if (!analyticsData) return;
    const csv = [
      'Metric,Value',
      `Total Images,${analyticsData.totalImages}`,
      `Total Cost,${analyticsData.totalCost}`,
      `Avg Generation Time (ms),${analyticsData.avgGenerationTime}`,
      `Credits Used,${analyticsData.creditsUsed}`,
      `Active Generations,${analyticsData.activeGenerations}`,
      '',
      'Model,Usage %',
      ...Object.entries(analyticsData.modelUsage).map(([m, p]) => `${m},${p}`),
      '',
      'Date,Images,Cost,Avg Time (ms)',
      ...analyticsData.dailyStats.map(d => `${d.date},${d.images},${d.cost},${d.avgTime}`),
      '',
      'Prompt,Uses,Avg Rating',
      ...analyticsData.topPrompts.map(p => `"${p.prompt.replace(/"/g, '""')}",${p.useCount},${p.avgRating}`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Start generating images to see analytics data here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            Track your AI image generation performance and costs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <button
            onClick={loadAnalytics}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Images', value: analyticsData.totalImages.toLocaleString(), icon: ImageIcon, from: 'from-blue-50', to: 'to-blue-100', border: 'border-blue-200', textColor: 'text-blue-600', valueColor: 'text-blue-900', iconColor: 'text-blue-600' },
          { label: 'Total Cost', value: formatCurrency(analyticsData.totalCost), icon: DollarSign, from: 'from-emerald-50', to: 'to-emerald-100', border: 'border-emerald-200', textColor: 'text-emerald-600', valueColor: 'text-emerald-900', iconColor: 'text-emerald-600' },
          { label: 'Avg Gen Time', value: formatTime(analyticsData.avgGenerationTime), icon: Clock, from: 'from-amber-50', to: 'to-amber-100', border: 'border-amber-200', textColor: 'text-amber-600', valueColor: 'text-amber-900', iconColor: 'text-amber-600' },
          { label: 'Credits Used', value: analyticsData.creditsUsed.toLocaleString(), icon: Zap, from: 'from-rose-50', to: 'to-rose-100', border: 'border-rose-200', textColor: 'text-rose-600', valueColor: 'text-rose-900', iconColor: 'text-rose-600' },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${metric.from} ${metric.to} p-5 rounded-xl border ${metric.border}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${metric.textColor} text-xs font-medium`}>{metric.label}</p>
                <p className={`text-2xl md:text-3xl font-bold ${metric.valueColor} mt-1`}>{metric.value}</p>
              </div>
              <metric.icon className={`w-7 h-7 ${metric.iconColor}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Usage */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Model Usage Distribution
          </h3>

          {Object.keys(analyticsData.modelUsage).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analyticsData.modelUsage)
                .sort(([, a], [, b]) => b - a)
                .map(([model, percentage]) => (
                  <div key={model} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize text-gray-700">{model.replace('-', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="bg-blue-600 h-2 rounded-full"
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-10 text-right">{percentage}%</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No generation data yet</p>
          )}
        </motion.div>

        {/* Daily Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Daily Trends
          </h3>

          <div className="flex items-center gap-3 mb-4">
            {(['images', 'cost', 'time'] as const).map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>

          {analyticsData.dailyStats.length > 0 ? (
            <div className="h-36 flex items-end gap-1">
              {analyticsData.dailyStats.slice(-14).map((day, index) => {
                const vals = analyticsData.dailyStats.slice(-14);
                const getValue = (d: typeof day) =>
                  selectedMetric === 'images' ? d.images :
                  selectedMetric === 'cost' ? d.cost * 25 :
                  d.avgTime / 100;
                const maxVal = Math.max(...vals.map(getValue), 1);
                const val = getValue(day);

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {selectedMetric === 'images' ? day.images :
                       selectedMetric === 'cost' ? `$${day.cost}` :
                       `${(day.avgTime / 1000).toFixed(1)}s`}
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / maxVal) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.03 }}
                      className="w-full bg-blue-500 rounded-t min-h-[2px] hover:bg-blue-600 transition-colors cursor-default"
                    />
                    <span className="text-[10px] text-gray-400">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">No daily data yet</p>
          )}
        </motion.div>

        {/* Top Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Top Performing Prompts
          </h3>

          {analyticsData.topPrompts.length > 0 ? (
            <div className="space-y-2">
              {analyticsData.topPrompts.slice(0, 6).map((prompt, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prompt.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{prompt.useCount} uses</span>
                      {prompt.avgRating > 0 && (
                        <span className="text-xs text-amber-600 flex items-center gap-0.5">
                          <span>&#9733;</span> {prompt.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2 shrink-0">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No prompt data yet. Generate images to see your top prompts.</p>
          )}
        </motion.div>

        {/* Activity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Activity Summary
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Images Generated</span>
              </div>
              <span className="text-lg font-bold text-blue-900">{analyticsData.totalImages}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Credits Used</span>
              </div>
              <span className="text-lg font-bold text-emerald-900">{analyticsData.creditsUsed}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">In Queue</span>
              </div>
              <span className="text-lg font-bold text-amber-900">{analyticsData.activeGenerations}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Models Used</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{Object.keys(analyticsData.modelUsage).length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleExport}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export as CSV
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
