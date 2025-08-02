import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

/**
 * Authentication layout for login/signup pages
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          to="/" 
          className="flex items-center justify-center space-x-2 text-gray-100 hover:text-indigo-400 transition-colors mb-6"
          aria-label="ReconOne Home"
        >
          <Shield className="h-12 w-12" />
          <span className="text-2xl font-bold">ReconOne</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-slate-700">
          <Outlet />
        </div>
      </div>
    </div>
  );
};