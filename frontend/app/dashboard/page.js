'use client'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, School, GraduationCap, Settings, Lock, Mail, MapPin } from 'lucide-react';
import Navbar from '../components/navbar';

// Helper function to map Clerk user data to our profile format
const mapClerkUserToProfile = (clerkUser) => {
  return {
    name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    school: clerkUser.publicMetadata?.school,
    major: clerkUser.publicMetadata?.major,
    year: clerkUser.publicMetadata?.year,
    location: clerkUser.publicMetadata?.location
  };
};

// Helper function for the search bar
const getMajorsList = () => majorsData.majors.map(m => m.major);


export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [hasSchoolInfo, setHasSchoolInfo] = useState(false);

  const [selectedMajor, setSelectedMajor] = useState('');

  // Authentication check - easy to switch to Clerk
  useEffect(() => {
    const checkAuth = () => {
      // TODO: Replace with Clerk authentication
      // Example Clerk integration:
      // const { isSignedIn, user } = useUser();
      // setIsLoggedIn(isSignedIn);
      // if (isSignedIn && user) {
      //   setUserProfile({
      //     name: user.fullName || `${user.firstName} ${user.lastName}`,
      //     email: user.emailAddresses[0]?.emailAddress,
      //     school: user.publicMetadata?.school,
      //     major: user.publicMetadata?.major,
      //     year: user.publicMetadata?.year,
      //     location: user.publicMetadata?.location
      //   });
      //   setHasSchoolInfo(!!user.publicMetadata?.school && !!user.publicMetadata?.major);
      // }

      // MOCK DATA - Remove when Clerk is integrated
      const USE_MOCK_DATA = true; // Set to false when Clerk is ready
      
      if (USE_MOCK_DATA) {
        setIsLoggedIn(true);
        
        const mockProfile = {
          name: "Nick Gerr",
          email: "nick.gerr@example.com",
          school: "NC State University",
          major: "Computer Science",
          year: "Junior",
          location: "Raleigh, NC"
        };
        
        setUserProfile(mockProfile);
        setHasSchoolInfo(!!mockProfile.school && !!mockProfile.major);
      } else {
        // Real Clerk integration would go here
        setIsLoggedIn(false);
        setUserProfile(null);
        setHasSchoolInfo(false);
      }
    };

    checkAuth();
  }, []);

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <LoginPrompt />
      </>
    );
  }

  if (!hasSchoolInfo) {
    return (
      <>
        <Navbar />
        <SchoolSetupPrompt userProfile={userProfile} />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <DashboardContent userProfile={userProfile} />
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
        <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Login
        </button>
        <button className="w-full border border-zinc-300 text-zinc-700 py-3 px-6 rounded-lg font-medium hover:bg-zinc-50 transition-colors">
          Register
        </button>
      </div>
    </motion.div>
  </div>
);

const SchoolSetupPrompt = ({ userProfile }) => (
  <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-white rounded-xl p-8 text-center"
    >
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <School className="w-8 h-8 text-orange-600" />
      </div>
      <h1 className="text-2xl font-medium text-zinc-900 mb-4">
        Complete Your Profile
      </h1>
      <p className="text-zinc-600 mb-8">
        To get the most out of Study Share, please specify your school and major so we can connect you with relevant study materials and forums.
      </p>
      <div className="space-y-4 mb-6">
        <div className="text-left">
          <label className="block text-sm font-medium text-zinc-700 mb-2">School</label>
          <input
            type="text"
            placeholder="Enter your school name"
            className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-left">
          <label className="block text-sm font-medium text-zinc-700 mb-2">Major</label>
          <input
            type="text"
            placeholder="Enter your major"
            className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-left">
          <label className="block text-sm font-medium text-zinc-700 mb-2">Year</label>
          <select className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Select your year</option>
            <option value="freshman">Freshman</option>
            <option value="sophomore">Sophomore</option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
            <option value="graduate">Graduate</option>
          </select>
        </div>
      </div>
      <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Complete Setup
      </button>
    </motion.div>
  </div>
);
const MajorDropdown = ({ selectedMajor, onMajorChange }) => {
  const majorsList = getMajorsList();
  
  return (
    <div className="text-left">
      <label className="block text-sm font-medium text-zinc-700 mb-2">Major</label>
      <select
        value={selectedMajor}
        onChange={(e) => onMajorChange(e.target.value)}
        className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select your major</option>
        {majorsList.map((major, index) => (
          <option key={index} value={major.value}>
            {major.label} - {major.university}
          </option>
        ))}
      </select>
    </div>
  );
};

const DashboardContent = ({ userProfile }) => (
  <div className="min-h-screen bg-zinc-50">
    {/* Header */}
    <div className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-zinc-900">Dashboard</h1>
            <p className="text-zinc-600 mt-1">Welcome back, {userProfile.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">{userProfile.school}</p>
              <p className="text-sm text-zinc-600">{userProfile.major} • {userProfile.year}</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 border border-zinc-200"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-medium text-zinc-900">12</p>
                  <p className="text-sm text-zinc-600">Notes Shared</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-zinc-200"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-medium text-zinc-900">156</p>
                  <p className="text-sm text-zinc-600">Upvotes Received</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-zinc-200"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <School className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-medium text-zinc-900">8</p>
                  <p className="text-sm text-zinc-600">Forums Joined</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-zinc-200"
          >
            <h3 className="text-lg font-medium text-zinc-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <p className="text-sm text-zinc-600">Shared notes for PY 205 - Physics for Engineering 1</p>
                <span className="text-xs text-zinc-400">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <p className="text-sm text-zinc-600">Received 5 upvotes on Calculus notes</p>
                <span className="text-xs text-zinc-400">1 day ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <p className="text-sm text-zinc-600">Joined Physics Study Group forum</p>
                <span className="text-xs text-zinc-400">3 days ago</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 border border-zinc-200"
        >
          <h3 className="text-lg font-medium text-zinc-900 mb-6">Account Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50 cursor-pointer">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Profile</p>
                <p className="text-xs text-zinc-600">Update your information</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50 cursor-pointer">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Change Password</p>
                <p className="text-xs text-zinc-600">Update your password</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50 cursor-pointer">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Email Settings</p>
                <p className="text-xs text-zinc-600">Manage notifications</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50 cursor-pointer">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">School Info</p>
                <p className="text-xs text-zinc-600">Update school & major</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);
