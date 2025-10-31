import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageSquare, Lightbulb } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  faqs?: FAQItem[];
}

const defaultFaqs: FAQItem[] = [
  {
    question: 'What is the difference between SmartVideo and VideoRemix?',
    answer: 'SmartVideo is our legacy product focusing primarily on video personalization, while VideoRemix is our comprehensive platform that focuses on image personalization with advanced features, integrations, and AI capabilities.',
  },
  {
    question: 'Can I use this for clients?',
    answer: 'Yes! All our plans include commercial licensing, allowing you to create personalized content for your clients. The different plans offer varying numbers of live projects you can have active at once.',
  },
  {
    question: 'Can I add personalized images?',
    answer: 'Absolutely. VideoRemix allows you to create personalized images with dynamic elements like names, custom text, and even personalized visuals that change based on your customer data.',
  },
  {
    question: 'Do I need design skills to create personalized images?',
    answer: 'No, you don\'t need any design skills. We provide a library of templates that you can use and customize with your personalization tokens. Our AI-powered tools make it easy to create professional personalized images.',
  },
  {
    question: 'Do I need to host the images myself?',
    answer: 'No. All images created with VideoRemix are hosted on our secure servers with high-speed CDN delivery. You can embed them on your website, landing pages, or share them directly via URL.',
  },
  {
    question: 'Subscription Policy',
    answer: 'Our subscriptions are billed monthly or annually (with a 20% discount). You can upgrade, downgrade, or cancel your subscription at any time from your account dashboard. Access to features will remain until the end of your billing period.',
  },
  {
    question: 'Refund Policy',
    answer: 'We offer a 14-day money-back guarantee for all new subscriptions. If you\'re not satisfied with our service, contact our support team within 14 days of your purchase for a full refund.',
  },
];

const FAQ: React.FC<FAQProps> = ({ 
  title = "Frequently Asked Questions",
  faqs = defaultFaqs
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] opacity-[0.02] bg-cover bg-center mix-blend-overlay"></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4"
          >
            Support
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4"
          >
            {title}
          </motion.h2>
          
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '120px' }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6 rounded-full"
          ></motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Find answers to common questions about VideoRemix
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="glass-panel p-0.5 overflow-hidden">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`border-b border-gray-100 last:border-b-0 overflow-hidden ${
                  activeIndex === index ? 'bg-gray-50/50' : 'bg-white/80'
                }`}
              >
                <button
                  className={`flex justify-between items-center w-full text-left py-5 px-6 transition-colors ${
                    activeIndex === index ? 'text-primary-700' : 'hover:text-primary-600'
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <motion.h3 
                    className={`text-lg font-medium flex items-center ${
                      activeIndex === index ? 'text-primary-700' : ''
                    }`}
                    initial={false}
                    animate={{ opacity: 1 }}
                  >
                    {index === 0 && <MessageSquare className="w-5 h-5 mr-2 text-primary-500" />}
                    {index === 1 && <Lightbulb className="w-5 h-5 mr-2 text-primary-500" />}
                    {faq.question}
                  </motion.h3>
                  <div className="ml-4 flex-shrink-0">
                    {activeIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-primary-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-primary-400" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="text-gray-600 pt-0 pb-6 px-6">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Still have questions? Our support team is here to help you with anything you need.
          </p>
          <a href="#contact" className="btn btn-primary inline-flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
export { FAQ };