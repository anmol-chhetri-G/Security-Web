import React from 'react';
import { features } from '../../data/mockData';
import { Zap, BarChart3, Shield } from 'lucide-react';

const iconMap = {
  Zap,
  BarChart3,
  Shield
};

/**
 * Three-column feature highlights
 */
export const FeaturesSection = () => {
  return (
    <section className="bg-slate-900 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
            Why Choose ReconOne?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built by security professionals for security professionals. 
            Our platform combines cutting-edge technology with ethical practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = iconMap[feature.icon];
            
            return (
              <div
                key={feature.id}
                className="text-center bg-slate-800 border border-slate-700 rounded-lg p-8 hover:border-indigo-500 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-lg mb-6">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};