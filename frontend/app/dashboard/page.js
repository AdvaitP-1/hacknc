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
        
        if (!isLoaded) return;
        
        if (!user) {
          setUserProfile(null);
          setUserStats(null);
          setRecentActivity([]);
          setLoading(false);
          return;
        }
        
        const clerkUserId = user.id;
        const API_BASE = 'http://localhost:5001/api/dashboard';
        
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
        setUserProfile(null);
        setUserStats(null);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    const createUserProfile = async (clerkUserId, clerkProfile) => {
      try {
        const response = await fetch('http://localhost:5001/api/dashboard/create-profile', {
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

  if (!isLoaded || loading) {
    return <LoadingSpinner message="Initializing dashboard..." />;
  }

  if (!user) {
    return <LoadingSpinner message="Redirecting to login..." />;
  }

  if (!userProfile) {
    return <LoadingSpinner message="Loading user data..." />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <DashboardHeader userProfile={userProfile} />
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <StatsCards userStats={userStats} />
              <RecentActivity recentActivity={recentActivity} />
            </div>
            
            <div>
              <AccountSettings />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}