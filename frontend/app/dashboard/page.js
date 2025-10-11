'use client'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Settings, Lock, Mail, MapPin, FileText, MessageSquare, Users } from 'lucide-react';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import Navbar from '../components/navbar';

const mapClerkUserToProfile = (clerkUser) => ({
  name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
  email: clerkUser.emailAddresses[0]?.emailAddress,
  school: clerkUser.publicMetadata?.school,
  major: clerkUser.publicMetadata?.major,
  location: clerkUser.publicMetadata?.location
});

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [hasSchoolInfo, setHasSchoolInfo] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        if (!isLoaded) return;
        
        if (!user) {
          setUserProfile(null);
          setHasSchoolInfo(false);
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
        setHasSchoolInfo(true);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setUserProfile(null);
        setHasSchoolInfo(false);
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
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-zinc-600">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <LoginPrompt />
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-zinc-600">Loading user data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <DashboardContent 
        userProfile={userProfile} 
        userStats={userStats}
        recentActivity={recentActivity}
      />
    </>
  );
}

const LoginPrompt = () => (
  <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-white rounded-xl p-8 text-center"
    >
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <User className="w-8 h-8 text-blue-600" />
      </div>
      <h1 className="text-2xl font-medium text-zinc-900 mb-4">
        Welcome to Study Share
      </h1>
      <p className="text-zinc-600 mb-8">
        You need to login or register to access your dashboard and start sharing notes with your college community.
      </p>
      <div className="space-y-3">
        <SignInButton mode="modal">
          <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Login
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="w-full border border-zinc-300 text-zinc-700 py-3 px-6 rounded-lg font-medium hover:bg-zinc-50 transition-colors">
            Register
          </button>
        </SignUpButton>
      </div>
    </motion.div>
  </div>
);


const DashboardContent = ({ userProfile, userStats, recentActivity }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => type === 'note' ? FileText : MessageSquare;
  const getActivityColor = (type) => type === 'note' ? 'bg-blue-600' : 'bg-green-600';

  return (
  <div className="min-h-screen bg-zinc-50">
    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-blue-100 text-lg"
            >
              Welcome back, {userProfile?.name || 'User'}! 👋
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center space-x-6"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-white">{userProfile?.university || 'School not specified'}</p>
              <p className="text-sm text-blue-100">{userProfile?.major || 'Major not specified'}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <span className="text-white font-bold text-lg">
                {(userProfile?.name || 'U').split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl mb-8"
          >
            <h2 className="text-2xl font-bold text-zinc-900 mb-8">📊 Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-3xl font-bold text-zinc-900">{userStats?.notes_shared || 0}</p>
                    <p className="text-sm font-medium text-zinc-600">Notes Shared</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-3xl font-bold text-zinc-900">{userStats?.forum_posts || 0}</p>
                    <p className="text-sm font-medium text-zinc-600">Forum Posts</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-3xl font-bold text-zinc-900">{userStats?.upvotes_received || 0}</p>
                    <p className="text-sm font-medium text-zinc-600">Upvotes Received</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-zinc-900 mb-8">⚡ Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity?.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.type);
                  const activityText = activity.type === 'note' 
                    ? `Shared notes for ${activity.course} - ${activity.title}`
                    : `Posted in ${activity.course} forum: ${activity.title}`;
                  
                  return (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${colorClass}`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-zinc-900">{activityText}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-zinc-500 font-medium">{formatDate(activity.created_at)}</span>
                          {activity.upvotes > 0 && (
                            <span className="text-xs text-zinc-600 bg-zinc-200 px-2 py-1 rounded-full font-medium">
                              {activity.upvotes} upvotes
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 font-medium">No recent activity yet</p>
                  <p className="text-zinc-400 text-sm">Start sharing notes or posting in forums!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl"
        >
          <h3 className="text-2xl font-bold text-zinc-900 mb-8">⚙️ Account Settings</h3>
          
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Profile</p>
                <p className="text-xs text-zinc-600 font-medium">Update your information</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Change Password</p>
                <p className="text-xs text-zinc-600 font-medium">Update your password</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Email Settings</p>
                <p className="text-xs text-zinc-600 font-medium">Manage notifications</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">School Info</p>
                <p className="text-xs text-zinc-600 font-medium">Update school & major</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
  );
};
