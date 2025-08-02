import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap } from 'lucide-react';

/**
 * Hero section with headline, subheading, and CTA buttons
 */
export const Hero = () => {
  return (
    <section className="bg-slate-900 pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Shield className="h-12 w-12 text-indigo-400" />
            <Zap className="h-8 w-8 text-indigo-400" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-100 mb-6">
            Professional{' '}
            <span className="text-indigo-400">OSINT</span>{' '}
            Platform
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Gather intelligence responsibly with our comprehensive suite of 
            open-source intelligence tools designed for cybersecurity professionals, 
            investigators, and researchers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <Link
              to="/features"
              className="w-full sm:w-auto border-2 border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Explore Features
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-400 mb-2">15+</div>
              <div className="text-gray-300">OSINT Tools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-400 mb-2">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};