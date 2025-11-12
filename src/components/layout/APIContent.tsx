import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Key, Code, AlertCircle } from 'lucide-react';

interface CodeExample {
  language: string;
  code: string;
}

interface APIContentProps {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  codeExamples: CodeExample[];
  responseExample?: string;
  rateLimit?: string;
}

const APIContent: React.FC<APIContentProps> = ({
  endpoint,
  method,
  description,
  parameters = [],
  codeExamples,
  responseExample,
  rateLimit
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(0);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const methodColors = {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded text-sm font-semibold ${methodColors[method]}`}>
            {method}
          </span>
          <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">{endpoint}</code>
        </div>
        <p className="text-gray-600">{description}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary-600" />
          Authentication
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-2">
            Include your API key in the Authorization header:
          </p>
          <code className="block bg-white p-3 rounded border border-blue-200 text-sm font-mono">
            Authorization: Bearer YOUR_API_KEY
          </code>
        </div>
      </section>

      {parameters.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Parameters</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Required</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parameters.map((param, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{param.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{param.type}</td>
                    <td className="px-4 py-3">
                      {param.required ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Optional</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-primary-600" />
          Code Examples
        </h2>

        <div className="flex gap-2 mb-4">
          {codeExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => setSelectedLanguage(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLanguage === index
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {example.language}
            </button>
          ))}
        </div>

        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm font-mono">{codeExamples[selectedLanguage].code}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(codeExamples[selectedLanguage].code, selectedLanguage)}
            className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
          >
            {copiedIndex === selectedLanguage ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </section>

      {responseExample && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Response Example</h2>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm font-mono">{responseExample}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(responseExample, 999)}
              className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
            >
              {copiedIndex === 999 ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </section>
      )}

      {rateLimit && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Rate Limits
          </h2>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">{rateLimit}</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default APIContent;
