import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import BehumanLogo from "@/components/BehumanLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu } from "lucide-react";

export default async function RecommendationsPage() {
  const supabase = await getSupabaseServerClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch user-specific recommended activities
  const { data: activities, error: actError } = await supabase
    .from("recommended_user_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (actError) {
    console.error("Error fetching activities:", actError);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <BehumanLogo size={64} />
        <h1 className="text-2xl font-bold">Error al cargar recomendaciones</h1>
        <p className="text-muted-foreground">
          No se pudieron cargar tus actividades recomendadas. Intenta de nuevo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <BehumanLogo size={44} />
          <h1 className="text-xl font-semibold">Recomendaciones</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* --- CONTENT --- */}
      <main className="p-4 space-y-4">
        {(!activities || activities.length === 0) && (
          <div className="text-center mt-16 space-y-2">
            <h2 className="text-lg font-bold">Sin actividades por ahora</h2>
            <p className="text-muted-foreground">
              Aún no hay recomendaciones listas para ti.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {activities?.map((activity) => (
            <Card key={activity.id} className="shadow-sm border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {activity.product_nombre}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Category */}
                <p className="text-sm text-muted-foreground">
                  <strong>Categoría:</strong> {activity.product_categoria}
                </p>

                {/* Tags */}
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

                {/* Reason */}
                {activity.reason && (
                  <p className="text-sm leading-relaxed">
                    <strong>¿Por qué recomendado?</strong> {activity.reason}
                  </p>
                )}

                {/* Price */}
                {activity.precio_desde && (
                  <p className="text-sm">
                    <strong>Precio desde:</strong> ${activity.precio_desde}
                  </p>
                )}

                {/* Status */}
                <p className="text-xs text-muted-foreground">
                  Estado: {activity.status || "pendiente"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

