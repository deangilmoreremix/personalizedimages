import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const integrations = [
  'Sendgrid', 'Sendinblue', 'Systeme.io', 'Activechat', 'Autoklose',
  'Gmail', 'Linkedin', 'Outlook', 'Salesforce', 'Lemlist',
  'Snovio', 'Woodpecker', 'Hubspot', 'Active Campaign', 'Apollo.io',
  'Mailerlite', 'Mailshake', 'Moosend', 'Outreach', 'Salesloft',
  'Freshworks', 'Google Sheets', 'Go HighLevel', 'Intercom', 'Mailchimp'
];

const IntegrationIcon: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-center h-16">
      <span className="text-gray-700 font-medium">{name}</span>
    </div>
  );
};

const Integrations: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="section bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="mb-4">VideoRemix Integrates with Top Marketing Platforms</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with your favorite tools to streamline your personalization workflow
          </p>
        </div>

        <motion.div 
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 md:grid-cols-5 gap-4"
        >
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <IntegrationIcon name={integration} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Integrations;