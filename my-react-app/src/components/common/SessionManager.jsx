import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const SessionManager = () => {
  const { user, apiRequest, logoutAllDevices } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/api/auth/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      } else {
        setError('Failed to fetch sessions');
      }
    } catch (err) {
      setError('Error fetching sessions');
      console.error('Fetch sessions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (window.confirm('Are you sure you want to logout from all devices? This will invalidate all your active sessions.')) {
      try {
        await logoutAllDevices();
      } catch (err) {
        setError('Failed to logout from all devices');
        console.error('Logout all devices error:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceInfo = (session) => {
    if (session.deviceInfo) {
      const { userAgent } = session.deviceInfo;
      if (userAgent) {
        // Simple device detection
        if (userAgent.includes('Mobile')) return 'Mobile Device';
        if (userAgent.includes('Tablet')) return 'Tablet';
        if (userAgent.includes('Windows')) return 'Windows PC';
        if (userAgent.includes('Mac')) return 'Mac';
        if (userAgent.includes('Linux')) return 'Linux PC';
        return 'Unknown Device';
      }
    }
    return 'Unknown Device';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Active Sessions</h2>
        <button
          onClick={handleLogoutAllDevices}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Logout All Devices
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No active sessions found.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold text-gray-800">
                      {getDeviceInfo(session)}
                    </h3>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>IP Address:</strong> {session.ipAddress || 'Unknown'}</p>
                    <p><strong>Last Activity:</strong> {formatDate(session.lastActivity)}</p>
                    <p><strong>Session Started:</strong> {formatDate(session.createdAt)}</p>
                  </div>

                  {session.deviceInfo?.userAgent && (
                    <details className="mt-3">
                      <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                        View User Agent
                      </summary>
                      <p className="text-xs text-gray-500 mt-2 break-all">
                        {session.deviceInfo.userAgent}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          These are all the devices currently logged into your account. 
          You can logout from all devices to invalidate all sessions.
        </p>
      </div>
    </div>
  );
};

export default SessionManager; 