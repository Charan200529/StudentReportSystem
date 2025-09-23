import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin, isTeacher, isStudent, isParent } from '@/utils/rbac';
import { 
  BookOpen, 
  FileText, 
  Users, 
  TrendingUp, 
  Bell,
  Award
} from 'lucide-react';
import { apiService } from '@/services/api';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ users: 0, courses: 0, assignments: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersData, coursesData, assignmentsData] = await Promise.all([
          apiService.getAllUsers(),
          apiService.getAllCourses(),
          apiService.getAllAssignments()
        ]);
        setCounts({
          users: usersData?.length || 0,
          courses: coursesData?.length || 0,
          assignments: assignmentsData?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
        setCounts({ users: 0, courses: 0, assignments: 0 });
      }
    };
    fetchCounts();
  }, []);

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{counts.users}</p>
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
            <p className="text-2xl font-semibold text-gray-900">{counts.courses}</p>
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
            <p className="text-2xl font-semibold text-gray-900">{counts.assignments}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Growth Rate</p>
            <p className="text-2xl font-semibold text-gray-900">+12%</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">My Courses</p>
            <p className="text-2xl font-semibold text-gray-900">4</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-2xl font-semibold text-gray-900">127</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending Grades</p>
            <p className="text-2xl font-semibold text-gray-900">23</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
            <p className="text-2xl font-semibold text-gray-900">5</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Due Assignments</p>
            <p className="text-2xl font-semibold text-gray-900">3</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Award className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">GPA</p>
            <p className="text-2xl font-semibold text-gray-900">3.8</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderParentDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Linked Students</p>
            <p className="text-2xl font-semibold text-gray-900">2</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Courses</p>
            <p className="text-2xl font-semibold text-gray-900">8</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bell className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Notifications</p>
            <p className="text-2xl font-semibold text-gray-900">5</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    if (isAdmin(user)) return renderAdminDashboard();
    if (isTeacher(user)) return renderTeacherDashboard();
    if (isStudent(user)) return renderStudentDashboard();
    if (isParent(user)) return renderParentDashboard();
    return null;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.displayName}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      {renderDashboardContent()}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">A</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  New assignment posted in Mathematics 101
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">G</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Your submission has been graded
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600">C</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  New course announcement posted
                </p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
