import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Users, 
  Settings, 
  GraduationCap,
  BarChart3,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole, isAdmin, isTeacher, isStudent, isParent } from '@/utils/rbac';
import { UserRole } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();



  const navigationItems: Array<{
    name: string;
    href: string;
    icon: any;
    roles: UserRole[];
  }> = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: BookOpen,
      roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Assignments',
      href: '/assignments',
      icon: FileText,
      roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    },
  ];

  const filteredNavigation = navigationItems.filter(item =>
    item.roles.some(role => hasRole(user, role))
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">
                SMS
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.roles?.join(', ') || 'No role'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Logout button removed */}
          <div className="px-4 py-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              Student Management System
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
