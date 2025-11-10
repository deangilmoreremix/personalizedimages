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
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { cloudGalleryService } from '../services/cloudGalleryService';
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';

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
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    avgSessionTime: number;
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

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get analytics data from the service
      const events = await cloudGalleryService.getAnalytics({
        limit: 1000,
        startDate: getStartDate()
      });

      // Process the data
      const processedData = processAnalyticsData(events);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    switch (dateRange) {
      case '7d':
        now.setDate(now.getDate() - 7);
        break;
      case '30d':
        now.setDate(now.getDate() - 30);
        break;
      case '90d':
        now.setDate(now.getDate() - 90);
        break;
    }
    return now.toISOString();
  };

  const processAnalyticsData = (events: any[]): AnalyticsData => {
    // Mock data processing - in real implementation, this would analyze the events
    const mockData: AnalyticsData = {
      totalImages: 1247,
      totalCost: 89.45,
      avgGenerationTime: 3240, // ms
      modelUsage: {
        'openai': 45,
        'gemini': 35,
        'imagen': 12,
        'gpt-image-1': 8
      },
      dailyStats: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        images: Math.floor(Math.random() * 50) + 10,
        cost: Math.random() * 5,
        avgTime: 2000 + Math.random() * 2000
      })),
      topPrompts: [
        { prompt: 'Professional headshot', useCount: 45, avgRating: 4.2 },
        { prompt: 'Product photography', useCount: 38, avgRating: 4.5 },
        { prompt: 'Social media post', useCount: 32, avgRating: 3.8 },
        { prompt: 'Marketing banner', useCount: 28, avgRating: 4.1 },
        { prompt: 'Team photo', useCount: 25, avgRating: 4.3 }
      ],
      userEngagement: {
        totalUsers: 156,
        activeUsers: 89,
        avgSessionTime: 1240 // seconds
      }
    };

    return mockData;
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
    <div className={DESIGN_SYSTEM.components.section}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className={commonStyles.sectionHeader}>
            <BarChart3 className="w-6 h-6 text-primary-500 mr-2" />
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Track your AI image generation performance and costs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadAnalytics}
            className={getButtonClasses('secondary')}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={`${getGridClasses(4)} mb-8`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Images</p>
              <p className="text-3xl font-bold text-blue-900">{analyticsData.totalImages.toLocaleString()}</p>
            </div>
            <ImageIcon className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Cost</p>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(analyticsData.totalCost)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Generation Time</p>
              <p className="text-3xl font-bold text-purple-900">{formatTime(analyticsData.avgGenerationTime)}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-orange-900">{analyticsData.userEngagement.activeUsers}</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Usage Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 text-primary-500 mr-2" />
            Model Usage Distribution
          </h3>

          <div className="space-y-3">
            {Object.entries(analyticsData.modelUsage).map(([model, percentage]) => (
              <div key={model} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  <span className="text-sm font-medium capitalize">{model.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-primary-500 mr-2" />
            Daily Trends
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedMetric('images')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedMetric === 'images'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setSelectedMetric('cost')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedMetric === 'cost'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Cost
              </button>
              <button
                onClick={() => setSelectedMetric('time')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedMetric === 'time'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Time
              </button>
            </div>

            <div className="h-32 flex items-end justify-between gap-1">
              {analyticsData.dailyStats.slice(0, 14).reverse().map((day, index) => {
                const value = selectedMetric === 'images' ? day.images :
                             selectedMetric === 'cost' ? day.cost * 20 :
                             day.avgTime / 100;
                const maxValue = Math.max(...analyticsData.dailyStats.map(d =>
                  selectedMetric === 'images' ? d.images :
                  selectedMetric === 'cost' ? d.cost * 20 :
                  d.avgTime / 100
                ));

                return (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div
                      className="w-6 bg-primary-500 rounded-t"
                      style={{ height: `${(value / maxValue) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 transform -rotate-45 origin-top">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Top Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 text-primary-500 mr-2" />
            Top Performing Prompts
          </h3>

          <div className="space-y-3">
            {analyticsData.topPrompts.map((prompt, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{prompt.prompt}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{prompt.useCount} uses</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-yellow-600">★</span>
                      <span className="text-xs text-gray-600">{prompt.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* User Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 text-primary-500 mr-2" />
            User Engagement
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Users</span>
              </div>
              <span className="text-lg font-bold text-blue-900">
                {analyticsData.userEngagement.totalUsers}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Active Users</span>
              </div>
              <span className="text-lg font-bold text-green-900">
                {analyticsData.userEngagement.activeUsers}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Avg Session Time</span>
              </div>
              <span className="text-lg font-bold text-purple-900">
                {formatDuration(analyticsData.userEngagement.avgSessionTime)}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Engagement Rate</span>
                <span className="font-medium text-gray-900">
                  {((analyticsData.userEngagement.activeUsers / analyticsData.userEngagement.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Export Actions */}
      <div className="mt-8 flex justify-center">
        <button className={`${getButtonClasses('secondary')} flex items-center gap-2`}>
          <Download className="w-4 h-4" />
          Export Analytics Report
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;