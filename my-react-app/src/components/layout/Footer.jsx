import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react';

/**
 * Site footer with links, social media, and copyright
 */
export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-100 hover:text-indigo-400 transition-colors mb-4"
              aria-label="ReconOne Home"
            >
              <Shield className="h-8 w-8" />
              <span className="text-xl font-bold">ReconOne</span>
            </Link>
            <p className="text-gray-300 text-sm max-w-md">
              Professional OSINT platform for cybersecurity professionals, 
              investigators, and researchers. Gather intelligence responsibly 
              and efficiently.
            </p>
            <div className="flex space-x-4 mt-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contact@reconone.com"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-100 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/features" 
                  className="text-gray-300 hover:text-indigo-400 transition-colors text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  to="/feedback" 
                  className="text-gray-300 hover:text-indigo-400 transition-colors text-sm"
                >
                  Feedback
                </Link>
              </li>
              <li>
                <Link 
                  to="/try-now" 
                  className="text-gray-300 hover:text-indigo-400 transition-colors text-sm"
                >
                  Try Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-gray-100 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/docs" 
                  className="text-gray-300 hover:text-indigo-400 transition-colors text-sm"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="/help" 
                  className="text-gray-300 hover:text-indigo-400 transition-colors text-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-gray-300 hover:text-indigo-400 transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 ReconOne. All rights reserved. Built for ethical OSINT research.
          </p>
        </div>
      </div>
    </footer>
  );
};