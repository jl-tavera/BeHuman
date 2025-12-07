"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import BehumanLogo from "@/components/BehumanLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/utils/supabase/client";

export default function RecommendationsPage() {
  const supabase = getSupabaseBrowserClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const isMobile = useIsMobile();

  // LOAD USER + ACTIVITIES ON CLIENT
  useEffect(() => {
    async function loadData() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth?.user) {
        redirect("/login");
        return;
      }

      const { data } = await supabase
        .from("recommended_user_activities")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      setActivities(data || []);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Cargando recomendaciones...
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
        {/* Header */}
        <header className="flex-shrink-0 pt-6 pb-3 px-6 sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-3 relative">
              {/* Mobile hamburger */}
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

              <div className="flex items-center gap-3">
                <BehumanLogo size={36} />
                <h1 className="text-xl font-bold">Recomendaciones</h1>
              </div>
            </div>

            <div className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Actividades recomendadas especialmente para ti
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32 w-full space-y-4">
          {activities.length === 0 && (
            <div className="text-center space-y-2 mt-16">
              <h2 className="text-lg font-bold">Sin actividades por ahora</h2>
              <p className="text-muted-foreground">
                Aún no hay recomendaciones listas para ti.
              </p>
            </div>
          )}

          {activities.map((activity) => (
            <Card key={activity.id} className="shadow-sm border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {activity.product_nombre}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Categoría:</strong> {activity.product_categoria}
                </p>

                {Array.isArray(activity.situation_tags) && (
                  <div className="flex flex-wrap gap-2">
                    {activity.situation_tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full text-xs bg-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {activity.reason && (
                  <p className="text-sm leading-relaxed">
                    <strong>¿Por qué recomendado?</strong> {activity.reason}
                  </p>
                )}

                {activity.precio_desde && (
                  <p className="text-sm">
                    <strong>Precio desde:</strong> ${activity.precio_desde}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Estado: {activity.status || "pendiente"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}


