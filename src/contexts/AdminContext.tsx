import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { checkIsAdmin, getCurrentUserRole, AdminRole } from '../services/adminService';
import { ensureStorageBucketExists } from '../services/landingPageContentService';

interface AdminContextType {
  isAdmin: boolean;
  isEditMode: boolean;
  userRole: AdminRole | null;
  isLoading: boolean;
  toggleEditMode: () => void;
  refreshAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userRole, setUserRole] = useState<AdminRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAdminStatus = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const adminStatus = await checkIsAdmin(user.id);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          const role = await getCurrentUserRole();
          setUserRole(role);
          await ensureStorageBucketExists();
        }
      } else {
        setIsAdmin(false);
        setUserRole(null);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAdminStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      refreshAdminStatus();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const toggleEditMode = () => {
    if (isAdmin) {
      setIsEditMode(prev => !prev);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isEditMode,
        userRole,
        isLoading,
        toggleEditMode,
        refreshAdminStatus
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
