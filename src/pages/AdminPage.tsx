import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase-secure';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardPage from '@/components/admin/DashboardPage';
import EventsPage from '@/components/admin/EventsPage';
import ProgramsPage from '@/pages/ProgramsPage';
import ContactsPage from '@/components/admin/ContactsPage';
import MediaPage from '@/components/admin/MediaPage';
import ContentPage from '@/components/admin/ContentPage';
import SettingsPage from '@/components/admin/SettingsPage';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminPage = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        navigate('/admin/login', { replace: true });
        return;
      }

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (adminError || !adminData) {
        console.warn('User not found in admin_users table:', adminError);
        navigate('/admin/login', { replace: true });
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/admin/login', { replace: true });
    }
  };

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Only render admin content if authenticated
  if (!isAuthenticated) {
    return null; // This shouldn't render, but just in case
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'events':
        return <EventsPage />;
      case 'programs':
        return <ProgramsPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'media':
        return <MediaPage />;
      case 'content':
        return <ContentPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </AdminLayout>
  );
};

export default AdminPage;
