import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, Shield, AlertCircle, CheckCircle, XCircle, 
  RefreshCw, Info, Code, Terminal, Zap, Cpu, Image as ImageIcon, Workflow, ClipboardCheck
} from 'lucide-react';

import { supabase, isSupabaseConfigured, callEdgeFunction } from '../utils/supabaseClient';
import { checkEdgeFunctionStatus, logEdgeFunctionDebugInfo, testEdgeFunction } from '../utils/edgeFunctionDebug';
import { hasApiKey } from '../utils/apiUtils';

const EdgeFunctionDebugging: React.FC = () => {
  const [functionStatus, setFunctionStatus] = useState<Record<string, boolean>>({});
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'testing' | 'logs'>('status');
  const [logOutput, setLogOutput] = useState<string[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<boolean>(false);
  const [apiKeysStatus, setApiKeysStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    logEdgeFunctionDebugInfo();
    checkSupabaseStatus();
    checkApiKeys();
    checkFunctionStatus();
  }, []);

  const checkSupabaseStatus = () => {
    const configured = isSupabaseConfigured();
    setSupabaseStatus(configured);
  };

  const checkApiKeys = () => {
    setApiKeysStatus({
      openai: hasApiKey('openai'),
      gemini: hasApiKey('gemini')
    });
  };

  const checkFunctionStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await checkEdgeFunctionStatus();
      setFunctionStatus(status);
    } catch (error) {
      console.error('Error checking function status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const runTest = async (functionName: string) => {
    setIsRunningTest(true);
    setTestResults(null);
    
    // Clear previous logs
    setLogOutput([]);
    
    // Set up console log interceptor
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    const interceptLogs = (method: 'log' | 'error' | 'warn', ...args: any[]) => {
      // Format the logs
      let formattedLog = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // Add a prefix based on the method
      const prefix = method === 'error' ? '❌ ' : 
                    method === 'warn' ? '⚠️ ' : 
                    '📝 ';
      
      formattedLog = prefix + formattedLog;
      
      // Update the log output
      setLogOutput(prev => [...prev, formattedLog]);
      
      // Call the original method
      if (method === 'error') originalConsoleError(...args);
      else if (method === 'warn') originalConsoleWarn(...args);
      else originalConsoleLog(...args);
    };
    
    // Override console methods
    console.log = (...args) => interceptLogs('log', ...args);
    console.error = (...args) => interceptLogs('error', ...args);
    console.warn = (...args) => interceptLogs('warn', ...args);
    
    try {
      // Generate a test payload based on the function name
      const testPayload = getTestPayloadForFunction(functionName);
      
      // Test the function
      const result = await testEdgeFunction({
        functionName,
        payload: testPayload,
        onSuccess: (data) => {
          setLogOutput(prev => [...prev, '✅ Function call successful']);
        },
        onError: (error) => {
          setLogOutput(prev => [...prev, `❌ Function call failed: ${error.message}`]);
        },
        onFallback: () => {
          setLogOutput(prev => [...prev, '⚠️ Using fallback mechanism']);
        }
      });
      
      setTestResults(result);
    } catch (error) {
      console.error('Error running test:', error);
    } finally {
      setIsRunningTest(false);
      
      // Restore console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    }
  };

  // Helper to generate a test payload for each function
  const getTestPayloadForFunction = (functionName: string): any => {
    switch (functionName) {
      case 'health-check':
        return {}; // No payload needed for health-check
      case 'action-figure':
        return {
          prompt: "A superhero action figure in a box with accessories",
          provider: "gemini"
        };
      case 'image-generation':
        return {
          prompt: "A beautiful sunset over mountains",
          provider: "gemini" 
        };
      case 'ghibli-image':
        return {
          prompt: "A peaceful village with a river and forest",
          provider: "gemini"
        };
      case 'crazy-image':
        return {
          prompt: "A surreal floating island with giant chess pieces",
          provider: "gemini"
        };
      case 'meme-generator':
        return {
          topText: "When you realize",
          bottomText: "your edge functions aren't working",
          referenceImageUrl: "https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg?auto=compress&cs=tinysrgb&w=600"
        };
      case 'reference-image':
        return {
          basePrompt: "Create a cartoon version of this person",
          provider: "gemini",
          referenceImageUrl: "https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg?auto=compress&cs=tinysrgb&w=600"
        };
      default:
        return { test: true };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <Server className="w-6 h-6 text-indigo-600 mr-2" />
              <h1 className="text-3xl font-bold">Edge Function Diagnostics</h1>
            </div>
            <p className="text-gray-600 mb-6">
              This page helps you diagnose and fix issues with Supabase Edge Functions
            </p>
          </motion.div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Supabase Configuration Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-full ${supabaseStatus ? 'bg-green-100' : 'bg-red-100'} mr-4`}>
                  {supabaseStatus ? (
                    <Shield className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Supabase Configuration</h3>
                  <p className="text-sm text-gray-500">
                    {supabaseStatus
                      ? 'Supabase is properly configured'
                      : 'Supabase configuration issues detected'}
                  </p>

                  {!supabaseStatus && (
                    <div className="mt-3 text-sm p-2 bg-red-50 border border-red-100 rounded-md text-red-700">
                      <p>Check your <code>.env</code> file for proper Supabase credentials:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>VITE_SUPABASE_URL must be a valid URL</li>
                        <li>VITE_SUPABASE_ANON_KEY must be set</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* API Keys Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-full bg-blue-100 mr-4`}>
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">API Keys</h3>
                  <div className="mt-2">
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full mr-2 ${apiKeysStatus.openai ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm">OpenAI API Key: {apiKeysStatus.openai ? 'Set' : 'Missing'}</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${apiKeysStatus.gemini ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm">Gemini API Key: {apiKeysStatus.gemini ? 'Set' : 'Missing'}</span>
                    </div>
                  </div>

                  {(!apiKeysStatus.openai && !apiKeysStatus.gemini) && (
                    <div className="mt-3 text-sm p-2 bg-yellow-50 border border-yellow-100 rounded-md text-yellow-700">
                      <p>No API keys configured. Add at least one API key to your <code>.env</code> file.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Edge Functions Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-full bg-purple-100 mr-4`}>
                  <Cpu className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-medium">Edge Functions</h3>
                    <button
                      onClick={checkFunctionStatus}
                      className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-full"
                      disabled={isCheckingStatus}
                    >
                      <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {Object.values(functionStatus).filter(Boolean).length} of {Object.keys(functionStatus).length} functions accessible
                  </p>
                  <div className="text-xs flex flex-wrap gap-1">
                    {Object.entries(functionStatus).map(([name, status]) => (
                      <div
                        key={name}
                        className={`px-2 py-1 rounded-full flex items-center 
                          ${status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {status ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'status' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('status')}
            >
              <Server className="w-4 h-4 inline mr-2" />
              Function Status
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'testing' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('testing')}
            >
              <ClipboardCheck className="w-4 h-4 inline mr-2" />
              Test Functions
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'logs' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('logs')}
            >
              <Terminal className="w-4 h-4 inline mr-2" />
              Debug Logs
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Status Tab */}
            {activeTab === 'status' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Server className="w-5 h-5 mr-2 text-indigo-600" />
                  Edge Function Status
                </h2>
                
                {isCheckingStatus ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <span className="ml-3 text-indigo-600 font-medium">Checking edge function status...</span>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-700 mb-2">System Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Supabase Configuration</h4>
                          <div className="flex items-center mb-2">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              supabaseStatus ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm">
                              {supabaseStatus 
                                ? 'Connected to Supabase'
                                : 'Not connected to Supabase'}
                            </span>
                          </div>
                          {supabaseStatus && supabase && (
                            <div className="text-xs text-gray-500 mt-1">
                              URL: {supabase.supabaseUrl}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">API Keys</h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${
                                apiKeysStatus.openai ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-sm">OpenAI API Key</span>
                            </div>
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${
                                apiKeysStatus.gemini ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-sm">Gemini API Key</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-700 mb-2">Edge Functions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(functionStatus).map(([name, status]) => (
                          <div 
                            key={name}
                            className={`p-4 ${status ? 'bg-green-50' : 'bg-red-50'} rounded-lg flex items-start`}
                          >
                            <div className={`p-2 rounded-full ${
                              status ? 'bg-green-100' : 'bg-red-100'
                            } mr-3`}>
                              {status ? (
                                <CheckCircle className={`w-5 h-5 ${
                                  status ? 'text-green-600' : 'text-red-600'
                                }`} />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{name}</h4>
                              <p className={`text-xs ${
                                status ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {status ? 'Accessible' : 'Not accessible'}
                              </p>
                              {!status && (
                                <button
                                  onClick={() => runTest(name)}
                                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
                                >
                                  Run Test →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <h3 className="font-medium text-indigo-800 flex items-center mb-2">
                        <Info className="w-5 h-5 text-indigo-600 mr-2" />
                        Next Steps
                      </h3>
                      <ul className="ml-7 space-y-1 text-sm text-indigo-700 list-disc">
                        <li>If functions are not accessible, ensure they are deployed to Supabase</li>
                        <li>For deployment, run <code className="bg-indigo-100 px-1 py-0.5 rounded">./deploy-edge-functions.sh</code></li>
                        <li>Check that your API keys are set in both environment variables and Supabase secrets</li>
                        <li>Use the Test Functions tab to debug specific functions</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Testing Tab */}
            {activeTab === 'testing' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <ClipboardCheck className="w-5 h-5 mr-2 text-indigo-600" />
                  Test Edge Functions
                </h2>
                
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-4">
                    Select a function to test and check the logs for detailed debugging information.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {['health-check', 'image-generation', 'action-figure', 'ghibli-image', 'crazy-image', 'meme-generator', 'reference-image'].map((functionName) => (
                      <button
                        key={functionName}
                        onClick={() => runTest(functionName)}
                        disabled={isRunningTest}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                      >
                        <div className="flex items-center mb-2">
                          {functionName === 'health-check' && <Cpu className="w-5 h-5 text-gray-600 mr-2" />}
                          {functionName === 'image-generation' && <ImageIcon className="w-5 h-5 text-gray-600 mr-2" />}
                          {functionName === 'action-figure' && <Box className="w-5 h-5 text-gray-600 mr-2" />}
                          {functionName === 'ghibli-image' && <Workflow className="w-5 h-5 text-gray-600 mr-2" />}
                          {functionName === 'crazy-image' && <Zap className="w-5 h-5 text-gray-600 mr-2" />}
                          {functionName === 'meme-generator' && <Workflow className="w-5 h-5 text-gray-600 mr-2" />}
                          {functionName === 'reference-image' && <ImageIcon className="w-5 h-5 text-gray-600 mr-2" />}
                          <h3 className="font-medium text-sm">{functionName}</h3>
                        </div>
                        <p className="text-xs text-gray-500 text-left">
                          Test the {functionName} edge function with sample data
                        </p>
                      </button>
                    ))}
                  </div>
                  
                  {isRunningTest && (
                    <div className="p-4 bg-blue-50 rounded-lg flex items-center border border-blue-100 mb-4">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                      <span className="text-blue-700">Running test...</span>
                    </div>
                  )}
                  
                  {testResults && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Test Results</h3>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <pre className="text-xs overflow-auto max-h-60">{JSON.stringify(testResults, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h3 className="font-medium text-indigo-800 flex items-center mb-2">
                      <Info className="w-5 h-5 text-indigo-600 mr-2" />
                      Deployment Instructions
                    </h3>
                    <p className="text-sm text-indigo-700 mb-2">
                      If your edge functions are not working, deploy them using the provided script:
                    </p>
                    <pre className="p-3 bg-indigo-900 text-indigo-100 rounded-md text-xs overflow-x-auto">
                      {`./deploy-edge-functions.sh\n\n# When prompted, enter your Supabase project reference`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
            
            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Terminal className="w-5 h-5 mr-2 text-indigo-600" />
                  Debug Logs
                </h2>
                
                <div className="p-4 bg-gray-900 rounded-lg text-gray-100 font-mono text-sm mb-4">
                  <div className="mb-2 flex items-center text-gray-400 border-b border-gray-700 pb-2">
                    <Code className="w-4 h-4 mr-2" />
                    <span>Console Output</span>
                  </div>
                  <div className="h-80 overflow-y-auto">
                    {logOutput.length === 0 ? (
                      <div className="text-gray-400 italic p-4 text-center">
                        Run a function test to see logs
                      </div>
                    ) : (
                      <div className="space-y-1 p-1">
                        {logOutput.map((log, index) => (
                          <div key={index} className="font-mono text-xs">
                            {log.startsWith('❌') ? (
                              <div className="text-red-400">{log}</div>
                            ) : log.startsWith('⚠️') ? (
                              <div className="text-yellow-400">{log}</div>
                            ) : log.startsWith('✅') ? (
                              <div className="text-green-400">{log}</div>
                            ) : (
                              <div>{log}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-100 rounded-lg">
                  <h3 className="font-medium mb-2">Monitoring Edge Functions</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    You can also view logs for your Edge Functions in the Supabase Dashboard:
                  </p>
                  <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
                    <li>Go to your <a href="https://app.supabase.com" className="text-indigo-600 hover:text-indigo-800" target="_blank" rel="noopener noreferrer">Supabase Dashboard</a></li>
                    <li>Select your project</li>
                    <li>Navigate to <strong>Edge Functions</strong> in the left sidebar</li>
                    <li>Select a function to view its invocation history and logs</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdgeFunctionDebugging;