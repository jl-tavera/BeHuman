"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { redirect } from "next/navigation";
import { getSupabaseBrowserClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const isMobile = useIsMobile();

  // Load authenticated user
  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        redirect("/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    redirect("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Cargando perfil...
      </div>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Page wrapper */}
      <div
        className={cn(
          "min-h-screen bg-background flex flex-col transition-all",
          !isMobile && "ml-64"
        )}
      >
        {/* HEADER */}
        <header className="flex-shrink-0 pt-6 pb-3 px-6 sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-3 relative">
              {/* Mobile menu button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              <h1 className="text-xl font-bold">Perfil</h1>
            </div>

            <div className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Información personal
              </p>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="max-w-3xl mx-auto px-4 py-10 pb-32 w-full space-y-8">
          {/* User Info Card */}
          <div className="border rounded-xl p-6 shadow-sm bg-card space-y-4">
            <h2 className="text-lg font-semibold">Datos del usuario</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-muted-foreground">ID de usuario</p>
                <p className="font-mono text-xs break-all">{user.id}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Cuenta creada</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Log out */}
          <div className="flex justify-center">
            <Button
              variant="destructive"
              className="px-6"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
