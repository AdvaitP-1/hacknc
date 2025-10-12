'use client'
import { FileText, Users, GraduationCap, TrendingUp } from 'lucide-react';

const StatsCards = ({ userStats }) => {
  const stats = [
    {
      icon: FileText,
      value: userStats?.notes_shared || 0,
      label: 'Notes Shared',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: Users,
      value: userStats?.forum_posts || 0,
      label: 'Forum Posts',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: GraduationCap,
      value: userStats?.upvotes_received || 0,
      label: 'Upvotes',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold">PERFORMANCE METRICS</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-500 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} glass-card p-6 border-2 ${stat.borderColor} relative overflow-hidden hover:shadow-lg transition-shadow duration-200`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-4xl font-bold text-black mono">
                    {stat.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min((stat.value / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCards;