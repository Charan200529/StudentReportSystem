import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ref, get, set } from '@firebase/database';
import { db } from '@/firebase/config';
import { User, UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole } from '@/utils/rbac';
import { 
  Users, 
  Shield, 
  GraduationCap, 
  User as UserIcon,
  Edit3,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserWithId extends User {
  id: string;
}

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingRoles, setEditingRoles] = useState<UserRole[]>([]);
  const [editingSemester, setEditingSemester] = useState<number | ''>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<number | ''>('');
  const queryClient = useQueryClient();

  // Check if current user is admin
  if (!currentUser || !hasRole(currentUser, 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch all users
  const { data: users, isLoading, error } = useQuery<UserWithId[]>(
    'users',
    async () => {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.keys(usersData).map(uid => ({
          id: uid,
          ...usersData[uid]
        })) as UserWithId[];
      }
      return [];
    }
  );

  const filteredUsers = (users || []).filter(u => {
    const roleOk = roleFilter === 'ALL' ? true : u.roles?.includes(roleFilter);
    const semOk = semesterFilter === '' ? true : (u.currentSemester ?? null) === semesterFilter;
    return roleOk && semOk;
  });

  // Update user roles mutation
  const updateUserRoles = useMutation(
    async ({ userId, roles, currentSemester }: { userId: string; roles: UserRole[]; currentSemester?: number }) => {
      const userRef = ref(db, `users/${userId}`);
      const snap = await get(userRef);
      const existing = snap.exists() ? snap.val() : {};
      await set(userRef, {
        ...existing,
        roles,
        ...(currentSemester ? { currentSemester } : {}),
        updatedAt: new Date().toISOString()
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User roles updated successfully');
        setEditingUser(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to update user roles: ${error.message}`);
      }
    }
  );

  const handleEditRoles = (user: UserWithId) => {
    setEditingUser(user.id);
    setEditingRoles([...user.roles]);
    setEditingSemester(user.currentSemester ?? '');
  };

  const handleSaveRoles = async (userId: string) => {
    if (editingRoles.length === 0) {
      toast.error('User must have at least one role');
      return;
    }
    
    await updateUserRoles.mutateAsync({ userId, roles: editingRoles, currentSemester: typeof editingSemester === 'number' ? editingSemester : undefined });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditingRoles([]);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'TEACHER':
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case 'STUDENT':
        return <UserIcon className="h-4 w-4 text-green-500" />;
      case 'PARENT':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (role) {
      case 'ADMIN':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'TEACHER':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'STUDENT':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'PARENT':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Users</h2>
          <p className="text-gray-600">Failed to load user data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage user accounts and roles. Only admins can access this page.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Filter by role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'ALL' | UserRole)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="ALL">All</option>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Filter by semester</label>
              <input
                type="number"
                min={1}
                max={12}
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Any"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setRoleFilter('ALL'); setSemesterFilter(''); }}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Users ({filteredUsers.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {user.displayName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {(['STUDENT', 'TEACHER', 'ADMIN', 'PARENT'] as UserRole[]).map((role) => (
                              <label key={role} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editingRoles.includes(role)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditingRoles([...editingRoles, role]);
                                    } else {
                                      setEditingRoles(editingRoles.filter(r => r !== role));
                                    }
                                  }}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{role}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span key={role} className={getRoleBadge(role)}>
                              {getRoleIcon(role)}
                              <span className="ml-1">{role}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={editingSemester}
                          onChange={(e) => setEditingSemester(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="1-12"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">{user.currentSemester ?? '-'}</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt instanceof Date 
                        ? user.createdAt.toLocaleDateString()
                        : new Date(user.createdAt).toLocaleDateString()
                      }
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser === user.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveRoles(user.id)}
                            disabled={updateUserRoles.isLoading}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditRoles(user)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit Roles
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Admin Instructions</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Only users with admin@gmail.com can access this page</li>
                  <li>You can change user roles to TEACHER, ADMIN, or STUDENT</li>
                  <li>Users must have at least one role assigned</li>
                  <li>Be careful when assigning ADMIN role - it gives full system access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
