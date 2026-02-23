import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CreditCard, CheckCircle, AlertCircle, Loader, Video } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, hasUserPurchasedVideo } from '../utils/stripeUtils';
import { useAuth } from '../auth/AuthContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface VideoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  imageUrl: string;
  videoId: string;
  onDownloadComplete?: () => void;
}

// Checkout Form Component
const CheckoutForm = ({ 
  videoId, 
  onSuccess, 
  onError 
}: { 
  videoId: string; 
  onSuccess: () => void; 
  onError: (message: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Create payment intent
      const { clientSecret } = await createPaymentIntent(100, { 
        videoId,
        userId: user?.id || 'anonymous'
      });

      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email: user?.email || '',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      onError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border border-gray-200 rounded-lg">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      {errorMessage && (
        <div className="text-red-500 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errorMessage}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-2 px-4 rounded-lg flex items-center justify-center ${
          loading 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-primary-600 hover:bg-primary-700 text-white'
        }`}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay $1.00
          </>
        )}
      </button>
    </form>
  );
};

const VideoDownloadModal: React.FC<VideoDownloadModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  imageUrl,
  videoId,
  onDownloadComplete
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user has already purchased this video
    const checkPurchaseStatus = async () => {
      if (user && videoId) {
        const purchased = await hasUserPurchasedVideo(user.id, videoId);
        setAlreadyPurchased(purchased);
      }
    };

    if (isOpen) {
      checkPurchaseStatus();
    }
  }, [isOpen, user, videoId]);

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
    // Wait a moment before allowing download
    setTimeout(() => {
      if (onDownloadComplete) {
        onDownloadComplete();
      }
    }, 1500);
  };

  const handlePaymentError = (message: string) => {
    setPaymentStatus('error');
    setErrorMessage(message);
  };

  const handleDownload = () => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `video-${videoId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onDownloadComplete) {
      onDownloadComplete();
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center">
              <Video className="w-5 h-5 text-primary-600 mr-2" />
              Download Video
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="p-6">
            {/* Preview */}
            <div className="mb-6">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img 
                  src={imageUrl} 
                  alt="Video preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/30 rounded-full p-3">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Preview of your generated video
              </p>
            </div>
            
            {alreadyPurchased || paymentStatus === 'success' ? (
              <div className="text-center">
                <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>{alreadyPurchased ? 'You already own this video!' : 'Payment successful!'}</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Complete Your Purchase</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Download this video for just $1.00. After payment, you'll have immediate access to download.
                  </p>
                  
                  <div className="bg-primary-50 p-3 rounded-lg text-sm text-primary-700 mb-4">
                    <p className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>One-time payment for permanent access to this video</span>
                    </p>
                  </div>
                </div>
                
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    videoId={videoId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VideoDownloadModal;