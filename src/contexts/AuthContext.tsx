import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '@/services/api';
import { User, LoginFormData, SignupFormData } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user profile
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await apiService.getProfile();
      const normalized: User = {
        uid: (userData.id ?? userData.uid ?? '').toString(),
        email: userData.email,
        displayName: userData.displayName ?? userData.name ?? 'User',
        roles: Array.isArray(userData.roles)
          ? userData.roles
          : userData.role
            ? [userData.role]
            : [],
        currentSemester: userData.currentSemester,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUser(normalized);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Token might be invalid, clear it
      apiService.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginFormData) => {
    try {
      const response = await apiService.login(data.email, data.password);
      
      // Convert Spring Boot response to our User type
      const userData: User = {
        uid: (response.id ?? '').toString(),
        email: response.email,
        displayName: response.displayName ?? 'User',
        roles: response.role ? [response.role] : Array.isArray(response.roles) ? response.roles : [],
        createdAt: new Date(),
        updatedAt: new Date(),
        currentSemester: response.currentSemester,
      };
      
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (data: SignupFormData) => {
    try {
      await apiService.signup(data.email, data.password, data.displayName);
      // After successful signup, automatically log in
      await login({ email: data.email, password: data.password });
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      apiService.setToken(null);
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update user data locally
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      // Here you would typically make an API call to update the user profile
      // For now, we'll just update the local state
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};