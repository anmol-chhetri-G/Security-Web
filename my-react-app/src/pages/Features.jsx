import React from 'react';
import { features } from '../data/mockData';
import { Zap, BarChart3, Shield, CheckCircle } from 'lucide-react';

const iconMap = {
  Zap,
  BarChart3,
  Shield
};

const additionalFeatures = [
  'Advanced search capabilities',
  'Real-time data processing',
  'Custom reporting tools',
  'API access and integrations',
  'Multi-source data correlation',
  'Automated threat detection',
  'Historical data analysis',
  'Team collaboration features'
];

/**
 * Detailed features page
 */
export const Features = () => {
  return (
    <div className="bg-slate-900">
      {/* Hero Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 mb-6">
              Comprehensive OSINT Features
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover the full range of capabilities that make ReconOne the 
              preferred choice for security professionals worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="bg-slate-800 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = iconMap[feature.icon];
              
              return (
                <div
                  key={feature.id}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-8 hover:border-indigo-500 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-lg mb-6">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-100 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  <button className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1">
                    Learn More →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features List */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-8 text-center">
              Everything You Need for OSINT
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};