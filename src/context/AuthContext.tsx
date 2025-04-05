import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// You'll need to replace this with your new auth provider
// This is just a placeholder structure that mimics the original behavior

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Replace this with your new auth solution's session check
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // On any auth error, clear user data for security
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Replace with your new auth provider's sign in method
      // Mocking successful sign in for placeholder
      const mockUser = { id: 'user-id', email };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Replace with your new auth provider's sign up method
      // Mocking successful sign up for placeholder
      const mockUser = { id: 'new-user-id', email };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Replace with your new auth provider's sign out method
      setUser(null);
      localStorage.removeItem('user');
      
      // Enhanced logout - force navigation to auth page
      navigate('/auth', { replace: true });
      
      // Clear any other stored data that might be user-specific
      sessionStorage.clear();
      
      // Safety measure: reload the page to clear any in-memory state
      // This ensures no protected routes can be accessed after logout
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
      // Force navigation to auth page even on error
      navigate('/auth', { replace: true });
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
