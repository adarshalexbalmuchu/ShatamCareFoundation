import React, { useState } from 'react';

const ProjectVerifier: React.FC = () => {
  const [info, setInfo] = useState<any>(null);

  const checkProject = () => {
    const fullUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const refMatch = fullUrl?.match(/^https?:\/\/([a-z0-9]{20})\.supabase\.co/i);
    const projectRef = refMatch ? refMatch[1] : 'UNKNOWN';
    const envInfo = {
      supabaseUrl: fullUrl,
      projectRef,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    };
    
    setInfo(envInfo);
  };

  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded">
      <h3 className="font-bold text-red-800">🚨 PROJECT VERIFICATION</h3>
      <p className="text-sm text-red-600 mb-3">
        Your bucket exists in SQL but API returns 400. This suggests wrong project connection.
      </p>
      
      <button 
        onClick={checkProject}
        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
      >
        🔍 Check Project Connection
      </button>

      {info && (
        <div className="mt-3 text-xs space-y-1">
          <div><strong>Detected Ref:</strong> {info.projectRef}</div>
          <div><strong>Your URL:</strong> {info.supabaseUrl || 'MISSING'}</div>
          <div>
            <strong>API Key:</strong> {info.hasAnonKey ? '✅ Present' : '❌ Missing'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectVerifier;
