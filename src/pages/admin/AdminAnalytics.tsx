import React from 'react';
import { BarChart3, Users, BookOpen, FileText, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();

  // Sample analytics data - in real app, this would come from Firebase
  const stats = {
    totalUsers: 1234,
    activeUsers: 1189,
    totalCourses: 45,
    activeCourses: 42,
    totalAssignments: 156,
    completedAssignments: 142,
    averageGrade: 85.2,
    growthRate: 12.5
  };

  const monthlyData = [
    { month: 'Jan', users: 1200, courses: 40, assignments: 140 },
    { month: 'Feb', users: 1220, courses: 42, assignments: 145 },
    { month: 'Mar', users: 1240, courses: 43, assignments: 150 },
    { month: 'Apr', users: 1260, courses: 44, assignments: 155 },
    { month: 'May', users: 1280, courses: 45, assignments: 160 },
    { month: 'Jun', users: 1300, courses: 46, assignments: 165 },
    { month: 'Jul', users: 1320, courses: 47, assignments: 170 },
    { month: 'Aug', users: 1340, courses: 48, assignments: 175 },
    { month: 'Sep', users: 1360, courses: 49, assignments: 180 },
    { month: 'Oct', users: 1380, courses: 50, assignments: 185 },
    { month: 'Nov', users: 1400, courses: 51, assignments: 190 },
    { month: 'Dec', users: 1420, courses: 52, assignments: 195 }
  ];

  const roleDistribution = [
    { role: 'Students', count: 850, percentage: 68.9 },
    { role: 'Teachers', count: 45, percentage: 3.6 },
    { role: 'Parents', count: 320, percentage: 25.9 },
    { role: 'Admins', count: 19, percentage: 1.5 }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          System overview and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">+{stats.growthRate}% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeCourses}</p>
              <p className="text-xs text-gray-500">of {stats.totalCourses} total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assignments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedAssignments}</p>
              <p className="text-xs text-gray-500">of {stats.totalAssignments} completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Grade</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageGrade}%</p>
              <p className="text-xs text-green-600">+2.1% from last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">User Growth</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyData.slice(-6).map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Users:</span>
                      <span className="text-sm font-medium text-gray-900">{data.users}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Courses:</span>
                      <span className="text-sm font-medium text-gray-900">{data.courses}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Role Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {roleDistribution.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.role}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    <span className="text-sm text-gray-500">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent System Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  15 new students enrolled in courses
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  New course "Advanced Mathematics" created
                </p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  23 assignments submitted and graded
                </p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
