import React, { useState } from 'react';
import { MapPin, Search, AlertTriangle, CheckCircle, Clock, Globe, Building, Map } from 'lucide-react';

export default function IpInfo() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ip-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'IP lookup failed');
      }
    } catch (err) {
      setError('IP lookup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-slate-900 pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-100 mb-2">IP Information</h2>
            <p className="text-gray-300">
              Get detailed information about IP addresses including location and ISP
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                value={ip}
                onChange={e => setIp(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Lookup
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-100 mb-2">IP Information Results</h3>
                <p className="text-gray-300">IP: {result.ip}</p>
                <p className="text-sm text-gray-400">Checked at: {new Date(result.checkedAt).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Information */}
                <div className="bg-slate-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Location
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Country:</span>
                      <span className="text-gray-100">{result.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Region:</span>
                      <span className="text-gray-100">{result.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">City:</span>
                      <span className="text-gray-100">{result.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Timezone:</span>
                      <span className="text-gray-100">{result.timezone}</span>
                    </div>
                    {result.coordinates && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Coordinates:</span>
                        <span className="text-gray-100">
                          {result.coordinates.lat}, {result.coordinates.lon}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Network Information */}
                <div className="bg-slate-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Network
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">ISP:</span>
                      <span className="text-gray-100">{result.isp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Organization:</span>
                      <span className="text-gray-100">{result.organization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Mobile:</span>
                      <span className={`${result.isMobile ? 'text-green-400' : 'text-red-400'}`}>
                        {result.isMobile ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Proxy/VPN:</span>
                      <span className={`${result.isProxy ? 'text-red-400' : 'text-green-400'}`}>
                        {result.isProxy ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Hosting:</span>
                      <span className={`${result.isHosting ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {result.isHosting ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-indigo-900/20 border border-indigo-700 rounded-lg p-4">
                <h4 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Summary
                </h4>
                <p className="text-gray-300 text-sm">
                  This IP address is located in {result.city}, {result.region}, {result.country} 
                  and is operated by {result.isp}.
                  {result.isProxy && ' This IP appears to be using a proxy or VPN service.'}
                  {result.isHosting && ' This IP is associated with a hosting provider.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 