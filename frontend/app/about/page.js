'use client'
import { useState, useEffect } from 'react';

export default function About() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/health');
        if (!response.ok) {
          throw new Error('Failed to fetch health data');
        }
        const data = await response.json();
        setHealthData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  return (
    <div>
      <h1>System Health</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div>
          <p>Error: {error}</p>
          <p>Make sure the backend server is running on port 5001</p>
        </div>
      )}
      
      {healthData && (
        <div>
          <h2>Status: {healthData.status}</h2>
          <h2>Service: {healthData.service}</h2>
          <h2>Timestamp: {healthData.timestamp}</h2>
          
          {healthData.system && (
            <div>
              <h3>System Information:</h3>
              <p>Platform: {healthData.system.platform}</p>
              <p>Version: {healthData.system.platform_version}</p>
              <p>Architecture: {healthData.system.architecture}</p>
              <p>Hostname: {healthData.system.hostname}</p>
            </div>
          )}
          
          {healthData.resources && (
            <div>
              <h3>Resource Usage:</h3>
              <p>CPU: {healthData.resources.cpu_percent}%</p>
              <p>Memory: {healthData.resources.memory_percent}%</p>
              <p>Disk: {healthData.resources.disk_percent}%</p>
              <p>Boot Time: {healthData.resources.boot_time}</p>
            </div>
          )}
          
          {healthData.uptime && (
            <div>
              <h3>Uptime:</h3>
              <p>Formatted: {healthData.uptime.formatted}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
