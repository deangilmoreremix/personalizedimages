import React from 'react';
import { Video, Facebook, Twitter, Instagram, Linkedin, Mail, Heart, ArrowRight, CheckCircle, Globe, MessageSquare, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white pt-16 pb-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
      
      {/* Light effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-40 bg-primary-600/30 rounded-full filter blur-[100px] opacity-20"></div>
      
      <div className="container-custom relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-lg">
                <Video className="h-8 w-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold gradient-text">
                VideoRemix
              </span>
            </div>
            <p className="text-gray-400 mb-6 border-l-2 border-primary-500 pl-4">
              Personalize your marketing content to boost engagement and conversions with revolutionary AI-powered tools.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50"
                  aria-label={`Social media link ${idx+1}`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center">
              <span className="w-8 h-0.5 bg-primary-500 rounded-full inline-block mr-2"></span>
              Products
            </h4>
            <ul className="space-y-3">
              {[
                {name: "GO by VideoRemix", highlight: true},
                {name: "Personalized Images", highlight: false},
                {name: "Smart Speech", highlight: false},
                {name: "Smart Marketer", highlight: false},
                {name: "Smart Campaigns", highlight: false}
              ].map((item, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className={`text-gray-400 hover:text-white transition-colors flex items-center ${
                      item.highlight ? "text-primary-400" : ""
                    }`}
                  >
                    {item.highlight && <CheckCircle className="w-4 h-4 mr-2 text-primary-500" />}
                    {item.name}
                    {item.highlight && <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary-500/20 text-primary-300 rounded">New</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center">
              <span className="w-8 h-0.5 bg-secondary-500 rounded-full inline-block mr-2"></span>
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                {name: "Knowledge Base", icon: <Globe className="w-4 h-4 mr-2 text-secondary-400" />},
                {name: "Tutorials", icon: <MessageSquare className="w-4 h-4 mr-2 text-secondary-400" />},
                {name: "Blog", icon: <HelpCircle className="w-4 h-4 mr-2 text-secondary-400" />},
                {name: "Webinars", icon: null},
                {name: "Case Studies", icon: null}
              ].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    {item.icon}
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center">
              <span className="w-8 h-0.5 bg-accent-500 rounded-full inline-block mr-2"></span>
              Contact Us
            </h4>
            <p className="text-gray-400 mb-4">Have questions? We're here to help!</p>
            <a href="mailto:support@videoremix.io" className="flex items-center mb-4 text-gray-400 hover:text-white transition-colors bg-gray-800/50 p-3 rounded-lg hover:bg-gray-700/50">
              <Mail className="h-5 w-5 mr-2 text-accent-400" />
              support@videoremix.io
            </a>
            
            <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg p-4 backdrop-blur-sm">
              <h5 className="font-medium mb-2 text-white">Newsletter</h5>
              <p className="text-sm text-gray-300 mb-3">Get product updates and news</p>
              <form className="flex space-x-2">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 flex-grow"
                />
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 p-2 rounded-lg">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} VideoRemix. All rights reserved.</p>
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex space-x-6 mb-4 sm:mb-0 sm:mr-8">
                <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Heart className="w-4 h-4 text-red-500 mr-2" />
                <span>Made with love in the cloud</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;