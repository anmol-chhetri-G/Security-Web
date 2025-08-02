import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Shield, Zap } from 'lucide-react';

/**
 * Conversion-focused call-to-action section
 */
export const CTASection = () => {
  return (
    <section className="bg-slate-900 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-6">
            Ready to Start Your Investigation?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of security professionals who trust ReconOne 
            for their OSINT needs. Start gathering intelligence today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center space-x-3">
              <Users className="h-8 w-8 text-indigo-400" />
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-100">15+</div>
                <div className="text-gray-300">OSINT Tools</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-8 w-8 text-indigo-400" />
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-100">99.9%</div>
                <div className="text-gray-300">Uptime</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <Zap className="h-8 w-8 text-indigo-400" />
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-100">24/7</div>
                <div className="text-gray-300">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};