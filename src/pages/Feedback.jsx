import React, { useState } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Dedicated feedback page
 */
export const Feedback = () => {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add authorization header if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          email: email || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.message || 'Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setEmail('');
    setIsSubmitted(false);
    setError('');
  };

  return (
    <div className="bg-slate-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <MessageSquare className="h-16 w-16 text-indigo-400 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 mb-4">
              Your Feedback Matters
            </h1>
            <p className="text-xl text-gray-300">
              Help us improve ReconOne by sharing your experience. Your insights 
              drive our development and help us serve you better.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <div className="text-green-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">
                Thank You for Your Feedback!
              </h2>
              <p className="text-gray-300 mb-6">
                Your input helps us improve ReconOne for everyone. We truly appreciate your time.
              </p>
              <button
                onClick={resetForm}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Submit Another Review
              </button>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Star Rating */}
                <div>
                  <label className="block text-lg font-medium text-gray-100 mb-4">
                    How would you rate your overall experience with ReconOne?
                  </label>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded p-1"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`h-12 w-12 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-gray-300 mt-2">
                      You rated us {rating} star{rating > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label 
                    htmlFor="comment" 
                    className="block text-lg font-medium text-gray-100 mb-4"
                  >
                    Tell us more about your experience
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like? What could be improved? Any specific features you'd like to see?"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    rows={6}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-lg font-medium text-gray-100 mb-4"
                  >
                    Email address {user ? '(pre-filled from your account)' : '(optional)'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={user?.email || "your@email.com"}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    {user ? 'Your account email will be used if left empty' : 'We\'ll only use this to follow up on your feedback if needed'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-medium text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-white" />
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};