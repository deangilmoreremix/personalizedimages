import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Sparkles, Zap, ArrowRight, Star, Gift, ShieldCheck, Clipboard, Code } from 'lucide-react';

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

const CTASection: React.FC<CTASectionProps> = ({
  title = "Personalize & 9X Your Conversion Rate Now!",
  description = "Join thousands of marketers who are boosting results with personalized images for every customer.",
  buttonText = "Start Personalizing Now!",
  buttonLink = "#signup"
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const floatingElements = [
    { icon: <Sparkles className="text-white/70" />, x: 20, y: 30, size: 'w-10 h-10' },
    { icon: <Zap className="text-white/70" />, x: 80, y: 20, size: 'w-8 h-8' },
    { icon: <Star className="text-white/70" />, x: 15, y: 80, size: 'w-6 h-6' },
    { icon: <Sparkles className="text-white/70" />, x: 70, y: 70, size: 'w-12 h-12' },
    { icon: <Star className="text-white/70" />, x: 40, y: 50, size: 'w-7 h-7' }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-700"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full filter blur-3xl"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        {/* Floating stars and sparkles */}
        {floatingElements.map((el, i) => (
          <motion.div
            key={i}
            className={`absolute ${el.size} opacity-30`}
            style={{ left: `${el.x}%`, top: `${el.y}%` }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, i % 2 === 0 ? 5 : -5, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
          >
            {el.icon}
          </motion.div>
        ))}
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center text-white"
        >
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 inline-flex items-center bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full"
          >
            <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
            <span className="font-medium">Personalized For Each Customer</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {title}
          </h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-white/90 max-w-3xl mx-auto mb-10"
          >
            {description}
          </motion.p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-10 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Everything You Need For Personalization</h3>
                
                {[
                  { icon: <ShieldCheck className="w-5 h-5 text-green-300" />, text: "Enterprise-Grade Personalization Security" },
                  { icon: <Code className="w-5 h-5 text-blue-300" />, text: "Powerful Personalization API Access" },
                  { icon: <Clipboard className="w-5 h-5 text-yellow-300" />, text: "Comprehensive Personalization Analytics" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="mt-0.5 mr-3">{item.icon}</div>
                    <p className="text-white/90">{item.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-white/20 rounded-xl p-5 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-sm text-yellow-200 mb-1">PERSONALIZATION PRO PLAN</div>
                  <div className="text-3xl font-bold text-white mb-1">$49<span className="text-xl">/mo</span></div>
                  <div className="text-white/70 mb-4">Save 20% with annual billing</div>
                  
                  <motion.a 
                    href={buttonLink} 
                    className="block py-3 px-6 rounded-xl bg-white text-primary-600 font-bold hover:shadow-lg transition-all"
                    whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
                  >
                    {buttonText}
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute -top-12 -right-8">
              <motion.div
                className="absolute -top-12 -right-8"
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, delay: 1, type: "spring" }}
              >
                <div className="bg-accent-500 text-white rounded-lg px-3 py-2 flex items-center text-sm font-medium transform rotate-6 shadow-lg">
                  <Gift className="w-4 h-4 mr-2" />
                  <span>14-day free personalization trial</span>
                </div>
                <div className="w-2 h-12 bg-accent-500 ml-6 rounded-b-full"></div>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-10 flex flex-wrap justify-center gap-6"
          >
            {[
              { count: '9,800+', label: 'Personalized Customers' },
              { count: '15M+', label: 'Personalized Images' },
              { count: '985%', label: 'Avg. Personalization Lift' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-sm px-7 py-4 rounded-xl"
              >
                <div className="text-2xl font-bold text-white">{stat.count}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
export { CTASection };