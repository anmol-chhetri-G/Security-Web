import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Search, CheckCircle, XCircle } from 'lucide-react';

export default function UserLookup() {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/scan-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.results);
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch {
      setError('Scan failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformUrl = (platform, username) => {
    const urls = {
      github: `https://github.com/${username}`,
      twitter: `https://twitter.com/${username}`,
      instagram: `https://instagram.com/${username}`,
      linkedin: `https://linkedin.com/in/${username}`,
      facebook: `https://facebook.com/${username}`,
      reddit: `https://reddit.com/user/${username}`,
      youtube: `https://youtube.com/@${username}`,
      tiktok: `https://tiktok.com/@${username}`
    };
    return urls[platform] || '#';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      github: '🐙',
      twitter: '🐦',
      instagram: '📷',
      linkedin: '💼',
      facebook: '📘',
      reddit: '🤖',
      youtube: '📺',
      tiktok: '🎵'
    };
    return icons[platform] || '🌐';
  };

  const getPlatformName = (platform) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <section className="bg-slate-900 pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-100 mb-2">User Lookup</h2>
            <p className="text-gray-300">
              Search usernames across multiple social media platforms
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Scan
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-indigo-400 mb-2">Results for: <span className="text-gray-100">{username}</span></h3>
                <p className="text-sm text-gray-400">
                  Found {Object.values(result).filter(Boolean).length} out of {Object.keys(result).length} platforms
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result).map(([platform, exists]) => (
                  <div 
                    key={platform} 
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      exists 
                        ? 'bg-green-900/20 border-green-700 hover:bg-green-900/30' 
                        : 'bg-slate-700/50 border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getPlatformIcon(platform)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-100 capitalize">
                            {getPlatformName(platform)}
                          </h4>
                          <p className={`text-sm ${exists ? 'text-green-400' : 'text-gray-400'}`}>
                            {exists ? 'Profile Found' : 'Not Found'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {exists ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <a
                              href={getPlatformUrl(platform, username)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
                            >
                              View Profile
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </>
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {Object.values(result).some(Boolean) && (
                <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-700 rounded-lg">
                  <h4 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Quick Access Links
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result)
                      .filter(([_, exists]) => exists)
                      .map(([platform, _]) => (
                        <a
                          key={platform}
                          href={getPlatformUrl(platform, username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          {getPlatformIcon(platform)} {getPlatformName(platform)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}