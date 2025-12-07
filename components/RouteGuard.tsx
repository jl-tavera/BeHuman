"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface RouteGuardProps {
  children: React.ReactNode;
  /** If true, only company users can access. If false, company users are blocked. */
  allowCompanyUsers?: boolean;
}

/**
 * RouteGuard component that controls access based on user type
 * - Company users can ONLY access /dashboard
 * - Regular users cannot access /dashboard
 */
export function RouteGuard({ children, allowCompanyUsers = false }: RouteGuardProps) {
  const { user, loading, isCompanyUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to load
    if (loading) {
      return;
    }

    // Public routes that don't need protection
    const publicRoutes = ['/login', '/register', '/'];
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // If user is logged in
    if (user) {
      // Company users can ONLY access dashboard
      if (isCompanyUser && !allowCompanyUsers) {
        router.replace('/dashboard');
      }
      // Regular users should NOT access dashboard
      else if (!isCompanyUser && allowCompanyUsers) {
        router.replace('/chat');
      }
    }
  }, [user, loading, isCompanyUser, allowCompanyUsers, router, pathname]);

  // Show nothing while loading to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return <>{children}</>;
}
