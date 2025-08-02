import React from 'react';
import { useNavigate } from 'react-router-dom';
import { tools } from '../../data/mockData';
import { Search, Globe, MapPin, Mail, AlertTriangle, Image, Coins, Eye, Shield } from 'lucide-react';

const iconMap = {
  Search,
  Globe,
  MapPin,
  Mail,
  AlertTriangle,
  Image,
  Coins,
  Eye,
  Shield
};

/**
 * Grid of available OSINT tools
 */
export const ToolsSection = () => {
  const navigate = useNavigate();

  const handleToolClick = (tool) => {
    if (!tool.isActive) return;
    
    switch (tool.name) {
      case 'User Lookup':
        navigate('/user-lookup');
        break;
      case 'IP Information':
        navigate('/ip-info');
        break;
      case 'Domain Information':
        navigate('/domain-info');
        break;
      case 'File Scanner':
        navigate('/file-scanner');
        break;
      default:
        // For future tools
        console.log(`${tool.name} - Coming soon!`);
    }
  };

  return (
    <section className="bg-slate-800 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
            Comprehensive OSINT Toolkit
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Access a wide range of intelligence gathering tools designed to help you 
            collect, analyze, and visualize data from multiple sources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const IconComponent = iconMap[tool.icon];
            
            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className={`bg-slate-900 border rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${
                  tool.isActive 
                    ? 'border-indigo-500 hover:border-indigo-400 cursor-pointer hover:scale-105' 
                    : 'border-slate-700 opacity-70 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    tool.isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-700 text-gray-300'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  {!tool.isActive && (
                    <span className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  {tool.name}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4">
                  {tool.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-400 font-medium">
                    {tool.category}
                  </span>
                  
                  {tool.isActive && (
                    <button 
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1"
                      aria-label={`Launch ${tool.name} tool`}
                    >
                      Launch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};