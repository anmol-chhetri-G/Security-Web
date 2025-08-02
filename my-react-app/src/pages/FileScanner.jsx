import React, { useState } from 'react';
import { Shield, Upload, AlertTriangle, CheckCircle, Clock, FileText, Zap, Eye, AlertCircle, Download, Info, X, Search, Filter } from 'lucide-react';

export default function CustomFileScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file);
      setError('');
      setResult(null);
      setShowDetails(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to scan');
      return;
    }

    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      console.log('Starting file upload...', selectedFile.name, selectedFile.size);
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Making request to /api/file-scanner/custom-scan');
      const res = await fetch('/api/file-scanner/custom-scan', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'File scan failed');
      }
    } catch (err) {
      console.error('File scan error:', err);
      setError('File scan failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-orange-400';
      case 'LOW': return 'text-yellow-400';
      case 'SAFE': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'HIGH': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'MEDIUM': return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      case 'LOW': return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'SAFE': return <CheckCircle className="h-5 w-5 text-green-400" />;
      default: return <Eye className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSeverityBgColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-orange-500';
      case 'LOW': return 'bg-yellow-500';
      case 'SAFE': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredStrings = result?.analysis?.strings?.filter(str => 
    str.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section className="bg-slate-900 pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-100 mb-2">Advanced File Scanner</h2>
              <p className="text-gray-300">
                Comprehensive file analysis using multiple security checks for malware detection
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mb-8">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-900/20' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-gray-100 font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mx-auto"
                    >
                      <X className="h-4 w-4" />
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-100">
                      Drag and drop a file here, or{' '}
                      <label className="text-purple-400 hover:text-purple-300 cursor-pointer">
                        browse
                        <input
                          type="file"
                          onChange={(e) => handleFileSelect(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports all file types (max 32MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <button
                  type="submit"
                  disabled={!selectedFile || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Analyze File
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
          </div>

          {result && (
            <div className="space-y-6">
              {/* Header with Risk Assessment */}
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100 mb-1">Analysis Results</h3>
                    <p className="text-gray-300">File: {result.filename}</p>
                    <p className="text-sm text-gray-400">
                      Analyzed at: {new Date(result.scannedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-2 ${getSeverityColor(result.severity)} mb-2`}>
                      {getSeverityIcon(result.severity)}
                      <span className="font-semibold text-lg">{result.severity}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Risk Score: {result.riskScore}/100
                    </div>
                  </div>
                </div>
                
                {/* Risk Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${getSeverityBgColor(result.severity)}`}
                    style={{ width: `${result.riskScore}%` }}
                  ></div>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-100 font-medium mb-2">Recommendation:</p>
                  <p className="text-gray-300 text-sm">{result.recommendation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* File Information */}
                <div className="dark:bg-slate-800 bg-white rounded-lg p-6">
                  <h4 className="text-lg font-semibold dark:text-gray-100 text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    File Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300 text-gray-600">Size:</span>
                      <span className="dark:text-gray-100 text-gray-900">{formatFileSize(result.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300 text-gray-600">Type:</span>
                      <span className="dark:text-gray-100 text-gray-900">{result.mimeType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300 text-gray-600">Entropy:</span>
                      <span className="dark:text-gray-100 text-gray-900">{result.analysis.entropy.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300 text-gray-600">File Type:</span>
                      <span className="dark:text-gray-100 text-gray-900">{result.analysis.fileType || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Security Analysis */}
                <div className="dark:bg-slate-800 bg-white rounded-lg p-6">
                  <h4 className="text-lg font-semibold dark:text-gray-100 text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Security Analysis
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300 text-gray-600">Executable:</span>
                      <span className={result.analysis.isExecutable ? 'text-red-400' : 'text-green-400'}>
                        {result.analysis.isExecutable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300 text-gray-600">Script:</span>
                      <span className={result.analysis.isScript ? 'text-orange-400' : 'text-green-400'}>
                        {result.analysis.isScript ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300 text-gray-600">Archive:</span>
                      <span className={result.analysis.isArchive ? 'text-yellow-400' : 'text-green-400'}>
                        {result.analysis.isArchive ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300 text-gray-600">Suspicious Content:</span>
                      <span className={result.analysis.hasSuspiciousContent ? 'text-red-400' : 'text-green-400'}>
                        {result.analysis.hasSuspiciousContent ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* File Hashes */}
                <div className="dark:bg-slate-800 bg-white rounded-lg p-6">
                  <h4 className="text-lg font-semibold dark:text-gray-100 text-gray-900 mb-4">File Hashes</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="dark:text-gray-300 text-gray-600 mb-1">MD5:</div>
                      <div className="dark:text-gray-100 text-gray-900 font-mono text-xs break-all">{result.hashes.md5}</div>
                    </div>
                    <div>
                      <div className="dark:text-gray-300 text-gray-600 mb-1">SHA1:</div>
                      <div className="dark:text-gray-100 text-gray-900 font-mono text-xs break-all">{result.hashes.sha1}</div>
                    </div>
                    <div>
                      <div className="dark:text-gray-300 text-gray-600 mb-1">SHA256:</div>
                      <div className="dark:text-gray-100 text-gray-900 font-mono text-xs break-all">{result.hashes.sha256}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Threats and Warnings */}
              {(result.threats.length > 0 || result.warnings.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {result.threats.length > 0 && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Threats Detected ({result.threats.length})
                      </h4>
                      <ul className="space-y-2">
                        {result.threats.map((threat, index) => (
                          <li key={index} className="text-red-300 text-sm flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            {threat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.warnings.length > 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Warnings ({result.warnings.length})
                      </h4>
                      <ul className="space-y-2">
                        {result.warnings.map((warning, index) => (
                          <li key={index} className="text-yellow-300 text-sm flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Strings with Search */}
              {result.analysis.strings && result.analysis.strings.length > 0 && (
                <div className="dark:bg-slate-800 bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold dark:text-gray-100 text-gray-900 flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Extracted Strings ({result.analysis.strings.length})
                    </h4>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                    >
                      {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                  
                  {showDetails && (
                    <>
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 dark:text-gray-400 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search strings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:placeholder-gray-400 bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto space-y-1">
                        {filteredStrings.slice(0, 50).map((str, index) => (
                          <div key={index} className="dark:text-gray-300 dark:bg-slate-700 text-gray-900 bg-gray-100 text-xs font-mono p-2 rounded hover:dark:bg-slate-600 hover:bg-gray-200 transition-colors">
                            {str}
                          </div>
                        ))}
                        {filteredStrings.length > 50 && (
                          <p className="dark:text-gray-400 text-gray-500 text-sm mt-2">
                            ... and {filteredStrings.length - 50} more strings
                          </p>
                        )}
                        {filteredStrings.length === 0 && searchTerm && (
                          <p className="dark:text-gray-400 text-gray-500 text-sm">No strings match your search.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 