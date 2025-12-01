import { useState, useCallback, useEffect } from 'react';
import { CreditManager } from '../../lib/credits';
import { useAuth } from './useAuth';

interface UseCreditTrackingOptions {
  onInsufficientCredits?: () => void;
  onCreditsConsumed?: (amount: number) => void;
}

export function useCreditTracking(options: UseCreditTrackingOptions = {}) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!user) return;

    try {
      const creditData = await CreditManager.getBalance(user.id);
      setBalance(creditData.balance);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [user]);

  // Check if user has enough credits
  const hasCredits = useCallback((amount: number) => {
    return balance >= amount;
  }, [balance]);

  // Consume credits with validation
  const consumeCredits = useCallback(async (
    amount: number,
    provider: string,
    operation: string,
    metadata: any = {}
  ): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const success = await CreditManager.consumeCredits(
        user.id,
        amount,
        provider,
        operation,
        metadata
      );

      if (success) {
        setBalance(prev => prev - amount);
        options.onCreditsConsumed?.(amount);
        return true;
      } else {
        options.onInsufficientCredits?.();
        return false;
      }
    } catch (error) {
      console.error('Failed to consume credits:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, options]);

  // Get cost for operation
  const getCost = useCallback(async (provider: string, operation: string): Promise<number> => {
    return await CreditManager.getCost(provider, operation);
  }, []);

  // Load balance on mount and when user changes
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return {
    balance,
    isLoading,
    hasCredits,
    consumeCredits,
    getCost,
    refreshBalance
  };
}