'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, MapPin, Settings, ChevronRight, Trash2 } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const AccountSettings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    try {
      await user.delete({
        confirmation: true
      });
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  }
  };
  const settings = [
    {
      icon: User,
      title: 'Profile Settings',
      description: 'Update your personal information',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'Manage passwords and 2FA',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: Mail,
      title: 'Notifications',
      description: 'Email and push preferences',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: MapPin,
      title: 'School Info',
      description: 'Update university and major',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center space-x-4"
      >
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-purple-500" />
        </div>
        <h3 className="text-2xl font-bold">CONTROL PANEL</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-500 to-transparent"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6 border-2 border-gray-200"
      >
        <div className="space-y-3">
          {settings.map((setting, index) => {
            const IconComponent = setting.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: -5 }}
                className={`group relative ${setting.bgColor} p-4 rounded-xl border-2 ${setting.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden`}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-3 gap-1 h-full">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="bg-black rounded-sm"></div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${setting.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black group-hover:text-purple-600 transition-colors">
                        {setting.title}
                      </p>
                      <p className="text-xs text-gray-600 mono">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ x: 5 }}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>

                {/* Hover effect line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-purple-700"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            );
          })}
        </div>
        <button
          onClick={handleDeleteAccount}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4" />
          Delete account
        </button>
      </motion.div>
    </div>
  );
};

export default AccountSettings;
