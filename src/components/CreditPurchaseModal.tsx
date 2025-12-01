import React, { useState, useEffect } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { CreditManager, CreditPackage } from '../../lib/credits';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPackage, setProcessingPackage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      CreditManager.getCreditPackages().then(setPackages);
    }
  }, [isOpen]);

  const handlePurchase = async (pkg: CreditPackage) => {
    setProcessingPackage(pkg.id);
    setLoading(true);

    try {
      // For now, simulate a purchase by adding credits directly
      // In production, this would integrate with Stripe
      const { data: { user } } = await import('../utils/supabaseClient').then(({ supabase }) => supabase!.auth.getUser());

      if (user) {
        await CreditManager.addCredits(
          user.id,
          pkg.creditsAmount,
          `Purchased ${pkg.name}`,
          { packageId: pkg.id, price: pkg.priceCents }
        );

        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
      setProcessingPackage(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Purchase Credits
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Choose a credit package to continue generating amazing AI images
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className={`border rounded-lg p-6 transition-all ${
                  pkg.isPopular
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {pkg.isPopular && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {pkg.description}
                  </p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${(pkg.priceCents / 100).toFixed(2)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {pkg.creditsAmount.toLocaleString()} credits
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    ${(pkg.priceCents / 100 / pkg.creditsAmount * 1000).toFixed(2)} per 1,000 credits
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    pkg.isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                >
                  {processingPackage === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Purchase ${pkg.creditsAmount} Credits`
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Credit Usage Examples
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• OpenAI DALL-E 3 image: 10 credits</li>
              <li>• Gemini image generation: 8 credits</li>
              <li>• Meme generation: 5 credits</li>
              <li>• Video generation: 50 credits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};