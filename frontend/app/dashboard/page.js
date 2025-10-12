'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';

// Import dashboard components
import LoadingSpinner from './components/LoadingSpinner';
import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import RecentActivity from './components/RecentActivity';
import AccountSettings from './components/AccountSettings';

const mapClerkUserToProfile = (clerkUser) => ({
  name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
  email: clerkUser.emailAddresses[0]?.emailAddress,
  school: clerkUser.publicMetadata?.school,
  major: clerkUser.publicMetadata?.major,
  location: clerkUser.publicMetadata?.location
});

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle redirect when user is not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/Auth');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isLoaded) return;
        
        if (!user) {
          setUserProfile(null);
          setUserStats(null);
          setRecentActivity([]);
          setLoading(false);
          return;
        }
        
        const clerkUserId = user.id;
        const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/dashboard`;
        
        // Check if backend is reachable first
        try {
          const healthCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/health/`);
          if (!healthCheck.ok) {
            throw new Error('Backend server is not responding');
          }
        } catch (healthError) {
          console.warn('Backend health check failed, using fallback data:', healthError);
          // Use fallback data instead of failing completely
          const clerkProfile = mapClerkUserToProfile(user);
          setUserProfile(clerkProfile);
          setUserStats({
            notes_shared: 0,
            forum_posts: 0,
            upvotes_received: 0,
            total_contributions: 0
          });
          setRecentActivity([]);
          setLoading(false);
          return;
        }
        
        const [profileRes, statsRes, activityRes] = await Promise.all([
          fetch(`${API_BASE}/user-profile?user_id=${clerkUserId}`),
          fetch(`${API_BASE}/stats?user_id=${clerkUserId}`),
          fetch(`${API_BASE}/recent-activity?user_id=${clerkUserId}&limit=5`)
        ]);

        const [profileData, statsData, activityData] = await Promise.all([
          profileRes.json(),
          statsRes.json(),
          activityRes.json()
        ]);

        if (profileData.success) {
          setUserProfile(profileData.data);
        } else {
          const clerkProfile = mapClerkUserToProfile(user);
          await createUserProfile(clerkUserId, clerkProfile);
        }

        setUserStats(statsData.success ? statsData.data : {
          notes_shared: 0,
          forum_posts: 0,
          upvotes_received: 0,
          total_contributions: 0
        });

        setRecentActivity(activityData.success ? activityData.data : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Using offline mode.');
        
        // Fallback to Clerk data
        const clerkProfile = mapClerkUserToProfile(user);
        setUserProfile(clerkProfile);
        setUserStats({
          notes_shared: 0,
          forum_posts: 0,
          upvotes_received: 0,
          total_contributions: 0
        });
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    const createUserProfile = async (clerkUserId, clerkProfile) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/dashboard/create-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_data: {
              clerk_user_id: clerkUserId,
              name: clerkProfile.name,
              email: clerkProfile.email,
              university: clerkProfile.school || null,
              major: clerkProfile.major || null,
              location: clerkProfile.location || null,
              created_at: new Date().toISOString()
            }
          })
        });
        
        const data = await response.json();
        setUserProfile(data.success ? data.data : clerkProfile);
      } catch (error) {
        console.error('Error creating user profile:', error);
        setUserProfile(clerkProfile);
      }
    };

    fetchDashboardData();
  }, [user, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <DashboardHeader userProfile={userProfile || { name: user.fullName || 'User', university: 'Not specified', major: 'Not specified' }} />
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
          </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                <div className="flex items-center">
                      <div className="w-5 h-5 text-yellow-600 mr-3">⚠️</div>
                      <p className="text-yellow-800 text-sm">{error}</p>
                  </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                  <StatsCards userStats={userStats} />
                  <RecentActivity recentActivity={recentActivity} />
        </div>

              <div>
                  <AccountSettings />
              </div>
              </div>
            </>
          )}
          </div>
      </div>
    </>
  );
}