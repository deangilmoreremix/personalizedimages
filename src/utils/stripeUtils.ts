import { supabase } from './supabaseClient';

/**
 * Creates a payment intent for video download
 * @param amount Amount in cents (e.g., 100 for $1.00)
 * @param metadata Additional metadata for the payment
 * @returns Payment intent details including client secret
 */
export async function createPaymentIntent(amount: number, metadata: Record<string, string> = {}) {
  try {
    // Try to use Supabase Edge Function for payment intent creation
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: { amount, metadata }
        });
        
        if (error) throw error;
        return data;
      } catch (edgeError) {
        console.warn('Edge function failed for payment intent creation:', edgeError);
        // Fall through to direct API call
      }
    }
    
    // Fallback to direct API call (not recommended for production)
    // In production, always use a backend to create payment intents
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, metadata }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Records a successful payment in the database
 * @param paymentIntentId The Stripe payment intent ID
 * @param userId The user ID
 * @param videoId The video ID that was purchased
 * @returns The created payment record
 */
async function recordPayment(paymentIntentId: string, userId: string, videoId: string) {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    const { data, error } = await supabase
      .from('user_payments')
      .insert([
        {
          user_id: userId,
          payment_intent_id: paymentIntentId,
          video_id: videoId,
          amount: 100, // $1.00 in cents
          status: 'completed'
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

/**
 * Checks if a user has already purchased a video
 * @param userId The user ID
 * @param videoId The video ID to check
 * @returns Boolean indicating if the video has been purchased
 */
export async function hasUserPurchasedVideo(userId: string, videoId: string): Promise<boolean> {
  try {
    if (!supabase) {
      return false; // Assume not purchased if Supabase is not available
    }
    
    const { data, error } = await supabase
      .from('user_payments')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .eq('status', 'completed')
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking video purchase status:', error);
    return false;
  }
}