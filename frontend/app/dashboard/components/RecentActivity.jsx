'use client'
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';

const RecentActivity = ({ recentActivity }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => type === 'note' ? FileText : MessageSquare;
  const getActivityColor = (type) => 'text-purple-500';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center space-x-4"
      >
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-purple-500" />
        </div>
        <h3 className="text-2xl font-bold">ACTIVITY LOG</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-500 to-transparent"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 border-2 border-gray-200"
      >
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
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="group relative p-4 bg-white/50 rounded-xl border border-gray-200 hover:border-cyan-300 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 bg-black rounded-lg flex items-center justify-center ${colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black group-hover:text-purple-600 transition-colors">
                        {activityText}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mono">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(activity.created_at)}</span>
                        </div>
                        {activity.upvotes > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            <span className="mono">{activity.upvotes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect line */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-700"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No activity detected</p>
              <p className="text-gray-400 text-sm mono mt-2">Start sharing to see your activity here</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RecentActivity;