'use client'
import { motion } from 'framer-motion';

const DashboardHeader = ({ userProfile }) => {

  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 gap-1 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-cyan-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.random() * 0.3 }}
              transition={{ 
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between">
          {/* Left side - Title */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl font-bold tracking-tight"
            >
              <span className="text-white">STUDIO</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                DASHBOARD
              </span>
            </motion.h1>
          </div>

          {/* Right side - User info with terminal-style */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="mono text-sm text-gray-400 ml-4">study-share@terminal</span>
            </div>
            
            <div className="mono text-cyan-400">
              <div>$ user.profile.load()</div>
              <div className="text-white ml-4">
                <div>name: "{userProfile?.name || 'Anonymous'}"</div>
                <div>university: "{userProfile?.university || 'Not specified'}"</div>
                <div>major: "{userProfile?.major || 'Not specified'}"</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

    </div>
  );
};

export default DashboardHeader;