import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { CreditManager, CreditTransaction } from '../../lib/credits';
import { useAuth } from '../hooks/useAuth';
import { CreditDisplay } from './CreditDisplay';
import { CreditPurchaseModal } from './CreditPurchaseModal';

export const CreditDashboard: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [balanceData, transactionsData, usageData] = await Promise.all([
        CreditManager.getBalance(user.id),
        CreditManager.getTransactionHistory(user.id, 20),
        CreditManager.getUsageStats(user.id, 30)
      ]);

      setBalance(balanceData);
      setTransactions(transactionsData);
      setUsageStats(usageData);
    } catch (error) {
      console.error('Failed to load credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'usage':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'bonus':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Credit Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your credit usage and purchase history
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <CreditDisplay />
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Purchase Credits</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {balance?.balance?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Purchased</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {balance?.totalPurchased?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Used</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {balance?.totalUsed?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usage Rate</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {usageStats ? Math.round((usageStats.totalCreditsUsed / 30) * 100) / 100 : 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">credits/day</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Provider */}
        {usageStats && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Usage by Provider (Last 30 Days)
            </h3>
            <div className="space-y-3">
              {Object.entries(usageStats.byProvider).map(([provider, credits]: [string, any]) => (
                <div key={provider} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="capitalize font-medium text-gray-900 dark:text-white">
                      {provider}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {credits.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">credits</span>
                  </div>
                </div>
              ))}
              {Object.keys(usageStats.byProvider).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No usage data available
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(tx.type)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {tx.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <div className={`font-semibold ${
                  tx.amount > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} credits
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No transactions yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Low Balance Warning */}
      {balance && balance.balance <= 10 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Low Credit Balance
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                You have {balance.balance} credits remaining. Purchase more credits to continue generating images.
              </p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Buy Credits
            </button>
          </div>
        </div>
      )}

      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={() => {
          setShowPurchaseModal(false);
          loadData();
        }}
      />
    </div>
  );
};