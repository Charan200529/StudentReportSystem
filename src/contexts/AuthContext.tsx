import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  getIdTokenResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from '@firebase/auth';
import { ref, set, get } from '@firebase/database';
import { auth, db } from '@/firebase/config';
import { User, UserRole, LoginFormData, SignupFormData } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  claims: any;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [claims, setClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip auth state changes during logout
      if (isLoggingOut) return;
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        try {
          // Get user claims (roles, etc.)
          const tokenResult = await getIdTokenResult(firebaseUser, true);
          setClaims(tokenResult.claims);

          // Get user profile from Realtime Database
          const userRef = ref(db, `users/${firebaseUser.uid}`);
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            // Check if this is an admin user (either by email or localStorage flag)
            const isAdmin = firebaseUser.email === 'admin@gmail.com' || localStorage.getItem('isAdminUser') === 'true';
            
            if (isAdmin) {
              // Force admin role for admin users
              setUser({
                ...userData,
                uid: firebaseUser.uid,
                roles: ['ADMIN'], // Always force admin role
                createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
                updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
              } as User);
            } else {
              setUser({
                ...userData,
                uid: firebaseUser.uid,
                createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
                updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
              } as User);
            }
          } else {
            // If user profile doesn't exist, create a basic one
            console.log('User profile not found, creating basic profile');
            const basicUserData: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              roles: firebaseUser.email === 'admin@gmail.com' ? ['ADMIN'] : ['STUDENT'], // Check if admin
              currentSemester: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await set(userRef, basicUserData);
            setUser(basicUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Even if Firestore fails, set basic user info from Firebase Auth
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            roles: ['STUDENT'],
            createdAt: new Date(),
            updatedAt: new Date(),
          } as User);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isLoggingOut]);

  const login = async (data: LoginFormData) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      // Check if this is the admin user
      if (data.email === 'admin@gmail.com') {
        // Set admin role in local state immediately
        const adminUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Admin',
          roles: ['ADMIN'],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(adminUser);
        setClaims({ roles: ['ADMIN'] });
        
        // Also save admin profile to database
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        await set(userRef, adminUser);
        
        // Set a flag to prevent role override
        localStorage.setItem('isAdminUser', 'true');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signup = async (data: SignupFormData) => {
    try {
      // Prevent admin signup through regular form
      if (data.email === 'admin@gmail.com') {
        throw new Error('Admin account cannot be created through signup form');
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );

      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: data.displayName
      });

      // Create user profile in Realtime Database - only STUDENT role allowed
      const userData: Omit<User, 'uid'> = {
        email: data.email,
        displayName: data.displayName,
        roles: ['STUDENT'], // Force STUDENT role for all signups
        currentSemester: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await set(ref(db, `users/${firebaseUser.uid}`), userData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      // Manually clear user state first
      setUser(null);
      setFirebaseUser(null);
      setClaims(null);
      // Clear admin flag
      localStorage.removeItem('isAdminUser');
      // Then sign out from Firebase
      await signOut(auth);
      console.log('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if Firebase signout fails, keep user logged out
    } finally {
      setIsLoggingOut(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedUser = { ...user, ...data, updatedAt: new Date() };
      await set(ref(db, `users/${user.uid}`), updatedUser);
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    claims,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
