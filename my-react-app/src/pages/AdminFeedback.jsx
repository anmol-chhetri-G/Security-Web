import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Star, Clock, AlertTriangle } from 'lucide-react';

export default function AdminFeedback() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/feedback/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <section className="bg-slate-900 pt-20 pb-16 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading feedback statistics...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900 pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <BarChart3 className="h-16 w-16 text-indigo-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-100 mb-4">
              Feedback Statistics
            </h1>
            <p className="text-xl text-gray-300">
              Overview of user feedback and ratings
            </p>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Submissions */}
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Submissions</p>
                    <p className="text-3xl font-bold text-gray-100">{stats.totalSubmissions}</p>
                  </div>
                  <Users className="h-8 w-8 text-indigo-400" />
                </div>
              </div>

              {/* Average Rating */}
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Average Rating</p>
                    <p className="text-3xl font-bold text-gray-100">{stats.averageRating}/5</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
              </div>

              {/* Last Submission */}
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Last Submission</p>
                    <p className="text-sm font-medium text-gray-100">
                      {stats.lastSubmission ? new Date(stats.lastSubmission).toLocaleDateString() : 'None'}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </div>
          )}

          {/* File Location Info */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Feedback Storage</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Storage Type:</span>
                <span className="text-gray-100">Text File</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">File Location:</span>
                <span className="text-gray-100 font-mono">my-backend/feedback/feedback.txt</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Format:</span>
                <span className="text-gray-100">Human-readable entries</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <p className="text-gray-300 text-sm">
                Each feedback submission is stored with the following information:
                username, email, rating, message, timestamp, user agent, and IP address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 