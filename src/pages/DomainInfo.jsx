import React, { useState } from 'react';
import { Globe, Search, AlertTriangle, CheckCircle, Clock, Calendar, Server } from 'lucide-react';

export default function DomainInfo() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/domain-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Domain lookup failed');
      }
    } catch (err) {
      setError('Domain lookup failed. Please try again.');
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
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-100 mb-2">Domain Information</h2>
            <p className="text-gray-300">
              Check domain registration and DNS information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter domain (e.g., google.com)"
                value={domain}
                onChange={e => setDomain(e.target.value)}
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
                <h3 className="text-xl font-semibold text-gray-100 mb-2">Domain Information Results</h3>
                <p className="text-gray-300">Domain: {result.domain}</p>
                <p className="text-sm text-gray-400">Checked at: {new Date(result.checkedAt).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DNS Information */}
                <div className="bg-slate-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    DNS Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span className={`${result.dns.hasRecords ? 'text-green-400' : 'text-red-400'}`}>
                        {result.dns.hasRecords ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">DNS Status:</span>
                      <span className="text-gray-100">{result.dns.status}</span>
                    </div>
                    {result.dns.ipAddresses.length > 0 && (
                      <div>
                        <span className="text-gray-300">IP Addresses:</span>
                        <div className="mt-1 space-y-1">
                          {result.dns.ipAddresses.map((ip, index) => (
                            <div key={index} className="text-gray-100 font-mono text-xs bg-slate-600 px-2 py-1 rounded">
                              {ip}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registration Information */}
                <div className="bg-slate-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Registration
                  </h4>
                  {result.whois ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Registrar:</span>
                        <span className="text-gray-100">{result.whois.registrar || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Created:</span>
                        <span className="text-gray-100">
                          {result.whois.createdDate ? new Date(result.whois.createdDate).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Expires:</span>
                        <span className="text-gray-100">
                          {result.whois.expiryDate ? new Date(result.whois.expiryDate).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Status:</span>
                        <span className="text-gray-100">{result.whois.status || 'Unknown'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Registration information not available
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-indigo-900/20 border border-indigo-700 rounded-lg p-4">
                <h4 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Summary
                </h4>
                <p className="text-gray-300 text-sm">
                  The domain {result.domain} is {result.dns.hasRecords ? 'active' : 'inactive'} 
                  with DNS status: {result.dns.status}.
                  {result.dns.ipAddresses.length > 0 && ` It resolves to ${result.dns.ipAddresses.length} IP address(es).`}
                  {result.whois && result.whois.registrar && ` It's registered with ${result.whois.registrar}.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 