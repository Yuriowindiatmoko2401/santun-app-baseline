'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LocalDebugPage() {
  const router = useRouter();
  const [redisInfo, setRedisInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchRedisInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/local-debug/redis');
      if (!response.ok) {
        throw new Error(`Failed to fetch Redis info: ${response.status}`);
      }
      
      const data = await response.json();
      setRedisInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching Redis info:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRedisInfo();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Local Development Debug Console</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to App
              </Button>
              <Button onClick={fetchRedisInfo} disabled={loading}>
                Refresh Data
              </Button>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            This page helps you debug and monitor the local development environment
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Redis Status</h2>
            
            {loading && <p>Loading Redis information...</p>}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded">
                {error}
              </div>
            )}
            
            {redisInfo && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Database Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                      <div className="text-2xl font-bold">{redisInfo.dbSize}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Keys</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                      <div className="text-2xl font-bold">{redisInfo.keyCounts.users}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Users</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
                      <div className="text-2xl font-bold">{redisInfo.keyCounts.conversations}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Conversations</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded">
                      <div className="text-2xl font-bold">{redisInfo.keyCounts.messages}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Messages</div>
                    </div>
                  </div>
                </div>
                
                {redisInfo.info?.Server && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Redis Server</h3>
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Version:</div>
                        <div className="font-mono">{redisInfo.info.Server.redis_version}</div>
                        <div>Mode:</div>
                        <div className="font-mono">{redisInfo.info.Server.redis_mode}</div>
                        <div>OS:</div>
                        <div className="font-mono">{redisInfo.info.Server.os}</div>
                        <div>Process ID:</div>
                        <div className="font-mono">{redisInfo.info.Server.process_id}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {redisInfo.info?.Memory && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Memory Usage</h3>
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Used Memory:</div>
                        <div className="font-mono">{(parseInt(redisInfo.info.Memory.used_memory) / 1024 / 1024).toFixed(2)} MB</div>
                        <div>Peak Memory:</div>
                        <div className="font-mono">{(parseInt(redisInfo.info.Memory.used_memory_peak) / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
          
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Development Tools</h2>
            
            <div className="space-y-4">
              <div className="border border-slate-200 dark:border-slate-700 p-4 rounded">
                <h3 className="text-lg font-medium mb-2">Redis Commander</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Visual interface for monitoring and editing Redis data
                </p>
                <a 
                  href="http://localhost:8081" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Open Redis Commander
                </a>
              </div>
              
              <div className="border border-slate-200 dark:border-slate-700 p-4 rounded">
                <h3 className="text-lg font-medium mb-2">Initialize Test Data</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Create sample users and conversations for testing
                </p>
                <Button onClick={() => window.location.href = "/api/local-debug/init-data"}>
                  Initialize Test Data
                </Button>
              </div>
              
              <div className="border border-slate-200 dark:border-slate-700 p-4 rounded">
                <h3 className="text-lg font-medium mb-2">Documentation</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <Link href="/local-auth" className="text-blue-500 hover:underline">
                      Local Authentication Page
                    </Link>
                  </p>
                  <p className="text-sm">
                    <a href="/LOCAL_DEVELOPMENT.md" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                      Local Development Guide
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {redisInfo && redisInfo.keyTypes && (
          <section className="mt-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Redis Key Explorer</h2>
            
            <div className="space-y-4">
              {Object.entries(redisInfo.keyTypes).map(([type, keys]: [string, any]) => (
                keys.length > 0 && (
                  <div key={type}>
                    <h3 className="text-lg font-medium capitalize mb-2">{type} ({keys.length})</h3>
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded max-h-40 overflow-y-auto text-sm font-mono">
                      {keys.map((key: string) => (
                        <div key={key} className="mb-1">{key}</div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
