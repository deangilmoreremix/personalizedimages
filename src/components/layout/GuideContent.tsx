import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lightbulb, Video, HelpCircle } from 'lucide-react';

interface GuideStep {
  title: string;
  description: string;
}

interface BestPractice {
  title: string;
  description: string;
}

interface Example {
  title: string;
  imageUrl?: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface GuideContentProps {
  steps: GuideStep[];
  bestPractices?: BestPractice[];
  examples?: Example[];
  faqs?: FAQ[];
  videoUrl?: string;
}

const GuideContent: React.FC<GuideContentProps> = ({
  steps,
  bestPractices = [],
  examples = [],
  faqs = [],
  videoUrl
}) => {
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {bestPractices.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Best Practices
          </h2>
          <div className="space-y-4">
            {bestPractices.map((practice, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-600" />
                  {practice.title}
                </h3>
                <p className="text-gray-700 text-sm">{practice.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {videoUrl && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Video className="w-6 h-6 text-primary-600" />
            Video Tutorial
          </h2>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {examples.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examples.map((example, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {example.imageUrl && (
                  <img src={example.imageUrl} alt={example.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{example.title}</h3>
                  <p className="text-gray-600 text-sm">{example.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <motion.svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-3 text-gray-600 text-sm border-t border-gray-200 pt-3"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default GuideContent;
