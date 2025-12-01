import { supabase } from '../src/utils/supabaseClient';

export interface CreditBalance {
  balance: number;
  totalPurchased: number;
  totalUsed: number;
}

export interface PricingTier {
  id: string;
  name: string;
  provider: string;
  operation: string;
  creditsPerUnit: number;
  unitName: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  creditsAmount: number;
  priceCents: number;
  currency: string;
  isPopular: boolean;
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  amount: number;
  balanceAfter: number;
  description: string;
  metadata: any;
  createdAt: string;
}

export class CreditManager {
  static async getBalance(userId: string): Promise<CreditBalance> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('balance, total_purchased, total_used')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Create initial balance if not exists
      if (error.code === 'PGRST116') {
        await this.initializeUserCredits(userId);
        return { balance: 0, totalPurchased: 0, totalUsed: 0 };
      }
      throw error;
    }

    return {
      balance: data.balance,
      totalPurchased: data.total_purchased,
      totalUsed: data.total_used
    };
  }

  static async initializeUserCredits(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        balance: 0,
        total_purchased: 0,
        total_used: 0
      });

    if (error) throw error;
  }

  static async addCredits(
    userId: string,
    amount: number,
    description: string,
    metadata: any = {}
  ): Promise<void> {
    // Get current balance
    const currentBalance = await this.getBalance(userId);
    const newBalance = currentBalance.balance + amount;
    const newTotalPurchased = currentBalance.totalPurchased + Math.max(0, amount);

    // Update balance
    const { error: balanceError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        balance: newBalance,
        total_purchased: newTotalPurchased,
        total_used: currentBalance.totalUsed,
        updated_at: new Date().toISOString()
      });

    if (balanceError) throw balanceError;

    // Log transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: amount > 0 ? 'purchase' : 'usage',
        amount: amount,
        balance_after: newBalance,
        description,
        metadata
      });

    if (transactionError) throw transactionError;
  }

  static async consumeCredits(
    userId: string,
    amount: number,
    provider: string,
    operation: string,
    metadata: any = {}
  ): Promise<boolean> {
    const currentBalance = await this.getBalance(userId);

    if (currentBalance.balance < amount) {
      return false; // Insufficient credits
    }

    const newBalance = currentBalance.balance - amount;
    const newTotalUsed = currentBalance.totalUsed + amount;

    // Update balance
    const { error: balanceError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        total_used: newTotalUsed,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (balanceError) throw balanceError;

    // Log transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'usage',
        amount: -amount,
        balance_after: newBalance,
        description: `${provider} ${operation}`,
        metadata
      });

    if (transactionError) throw transactionError;

    // Log usage
    const { error: usageError } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        provider,
        operation,
        credits_used: amount,
        request_metadata: metadata.request || {},
        response_metadata: metadata.response || {}
      });

    if (usageError) throw usageError;

    return true;
  }

  static async getPricingTiers(): Promise<PricingTier[]> {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  static async getCreditPackages(): Promise<CreditPackage[]> {
    const { data, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data;
  }

  static async getCost(provider: string, operation: string): Promise<number> {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('credits_per_unit')
      .eq('provider', provider)
      .eq('operation', operation)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data.credits_per_unit;
  }

  static async getTransactionHistory(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balanceAfter: tx.balance_after,
      description: tx.description,
      metadata: tx.metadata,
      createdAt: tx.created_at
    }));
  }

  static async getUsageStats(userId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('usage_logs')
      .select('provider, operation, credits_used, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Aggregate usage by provider and operation
    const stats = {
      totalCreditsUsed: 0,
      byProvider: {} as Record<string, number>,
      byOperation: {} as Record<string, number>,
      dailyUsage: [] as Array<{ date: string; credits: number }>
    };

    data.forEach(log => {
      stats.totalCreditsUsed += log.credits_used;

      stats.byProvider[log.provider] = (stats.byProvider[log.provider] || 0) + log.credits_used;
      stats.byOperation[log.operation] = (stats.byOperation[log.operation] || 0) + log.credits_used;
    });

    return stats;
  }

  // Admin functions for managing pricing
  static async createPricingTier(tier: Omit<PricingTier, 'id'>): Promise<PricingTier> {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .insert(tier)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePricingTier(id: string, updates: Partial<PricingTier>): Promise<void> {
    const { error } = await supabase
      .from('pricing_tiers')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async createCreditPackage(pkg: Omit<CreditPackage, 'id'>): Promise<CreditPackage> {
    const { data, error } = await supabase
      .from('credit_packages')
      .insert(pkg)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Utility function to give bonus credits
  static async giveBonusCredits(userId: string, amount: number, reason: string): Promise<void> {
    await this.addCredits(userId, amount, `Bonus: ${reason}`, { type: 'bonus', reason });
  }
}