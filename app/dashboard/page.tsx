"use client";

import { useState, useEffect } from "react";
import { Check, X, ChevronRight } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import PuzzleAreaCards from "@/components/dashboard/PuzzleAreaCards";
import BehumanLogo from "@/components/BehumanLogo";
import { RouteGuard } from "@/components/RouteGuard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getAreaBasedMetrics,
  getDashboardMetrics,
  getWellnessRecommendations,
  approveWellnessRecommendation,
  rejectWellnessRecommendation,
  type AreaData,
  type DashboardMetrics,
  type WellnessRecommendation,
} from "./actions";

// Using WellnessRecommendation type from actions.ts

const priorityColors = {
  alta: "bg-red-100 text-red-700 border-red-200",
  media: "bg-amber-100 text-amber-700 border-amber-200",
  baja: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const Dashboard = () => {
  // Data state
  const [areasData, setAreasData] = useState<AreaData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    generalStress: 0,
    anxietyInterventions: 0,
    criticalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Budget state
  const [monthlyBudget] = useState(5000);
  const [availableBudget, setAvailableBudget] = useState(5000);
  const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>([]);
  const [approvedByArea, setApprovedByArea] = useState<Record<string, number>>({
    "Marketing": 0,
    "Recursos Humanos": 0,
    "Operaciones": 0,
    "Ventas": 0,
    "Toda la empresa": 0,
  });
  const [selectedRecommendation, setSelectedRecommendation] = useState<WellnessRecommendation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<{ open: boolean; approved: boolean }>({ open: false, approved: false });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [areas, dashboardMetrics, wellnessRecs] = await Promise.all([
          getAreaBasedMetrics(),
          getDashboardMetrics(),
          getWellnessRecommendations(),
        ]);

        setAreasData(areas);
        setMetrics(dashboardMetrics);
        setRecommendations(wellnessRecs);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const spentBudget = monthlyBudget - availableBudget;
  const spentPercentage = (spentBudget / monthlyBudget) * 100;

  const handleRowClick = (rec: WellnessRecommendation) => {
    setSelectedRecommendation(rec);
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (selectedRecommendation) {
      try {
        await approveWellnessRecommendation(selectedRecommendation.id);
        
        // Update local state
        setAvailableBudget(prev => prev - selectedRecommendation.recommended_product_price);
        setApprovedByArea(prev => ({
          ...prev,
          [selectedRecommendation.situation_type]: (prev[selectedRecommendation.situation_type] || 0) + selectedRecommendation.recommended_product_price
        }));
        setRecommendations(prev => prev.filter(r => r.id !== selectedRecommendation.id));
        setDialogOpen(false);
        setResultDialog({ open: true, approved: true });
      } catch (error) {
        console.error('Error approving recommendation:', error);
      }
    }
  };

  const handleReject = async () => {
    if (selectedRecommendation) {
      try {
        await rejectWellnessRecommendation(selectedRecommendation.id, 'Declined by HR admin');
        
        // Update local state
        setRecommendations(prev => prev.filter(r => r.id !== selectedRecommendation.id));
        setDialogOpen(false);
        setResultDialog({ open: true, approved: false });
      } catch (error) {
        console.error('Error rejecting recommendation:', error);
      }
    }
  };

  const closeResultDialog = () => {
    setResultDialog({ open: false, approved: false });
    setSelectedRecommendation(null);
  };

  return (
    <RouteGuard allowCompanyUsers={true}>
      <div className="min-h-screen bg-background p-6 md:p-10">
        {/* Header con logo y título */}
        <div className="flex items-center gap-3 mb-8">
          <BehumanLogo size={40} />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">behuman</h1>
        </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Cargando datos del dashboard...</div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KpiCard
          title="Estrés general de la compañía"
          value={loading ? 0 : Math.round(metrics.generalStress)}
          subtitle="Índice promedio de estrés percibido"
          showPercentage
          invertColors
        />
        <KpiCard
          title="Ataques de ansiedad intervenidos"
          value={loading ? 0 : metrics.anxietyInterventions}
          subtitle="Intervenciones realizadas este mes"
        />
        <KpiCard
          title="Alertas de casos críticos"
          value={loading ? 0 : metrics.criticalAlerts}
          subtitle="Casos que requieren atención inmediata"
          forceColor="red"
        />
      </div>

      {/* Áreas - ahora ocupa todo el ancho */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Por área</h2>
        <PuzzleAreaCards areas={areasData} />
      </div>

      {/* Sección de Recomendaciones */}
      <div className="mt-12 border-t border-border pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de presupuesto */}
          <div className="lg:w-80 space-y-8">
            <div className="space-y-3">
              <p className="text-lg text-muted-foreground">Presupuesto mensual</p>
              <p className="text-5xl font-bold text-foreground">
                ${availableBudget.toLocaleString()}
              </p>
              <p className="text-base text-muted-foreground">
                de ${monthlyBudget.toLocaleString()} disponible
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-lg font-semibold text-foreground">Inversión mensual por área</p>
              <div className="space-y-3">
                {Object.entries(approvedByArea)
                  .filter(([area]) => area !== "Toda la empresa")
                  .map(([area, amount]) => (
                    <div key={area} className="flex justify-between text-base">
                      <span className="text-muted-foreground">{area}</span>
                      <span className="font-medium text-foreground">${amount.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Contenido principal de recomendaciones */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-4">Inversión de Bienestar Diciembre</h2>
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-green-500">${spentBudget.toLocaleString()}</span>
                <span className="font-bold text-foreground text-2xl">${monthlyBudget.toLocaleString()}</span>
              </div>
              <Progress value={spentPercentage} className="h-3 [&>div]:bg-green-500" />
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold text-foreground">Recomendación</TableHead>
                    <TableHead className="font-bold text-foreground">Área</TableHead>
                    <TableHead className="font-bold text-foreground">Costo</TableHead>
                    <TableHead className="font-bold text-foreground">Prioridad</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.length > 0 ? (
                    recommendations.map((rec) => (
                      <TableRow
                        key={rec.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(rec)}
                      >
                        <TableCell className="font-medium">{rec.recommended_product_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {rec.situation_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>${rec.recommended_product_price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            rec.situation_confidence > 0.8 ? "bg-red-100 text-red-700 border-red-200" :
                            rec.situation_confidence > 0.5 ? "bg-amber-100 text-amber-700 border-amber-200" :
                            "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }>
                            {rec.situation_confidence > 0.8 ? 'Alta' : 
                             rec.situation_confidence > 0.5 ? 'Media' : 'Baja'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay peticiones pendientes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aprobar Recomendación de Bienestar</DialogTitle>
            <DialogDescription>
              Revisar recomendación para empleado en situación: {selectedRecommendation?.situation_type.replace('_', ' ')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Producto Recomendado</p>
                <p className="text-sm text-muted-foreground">{selectedRecommendation?.recommended_product_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Costo</p>
                <p className="text-sm text-muted-foreground">${selectedRecommendation?.recommended_product_price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Situación Detectada</p>
                <p className="text-sm text-muted-foreground capitalize">{selectedRecommendation?.situation_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Confianza</p>
                <p className="text-sm text-muted-foreground">{((selectedRecommendation?.situation_confidence || 0) * 100).toFixed(0)}%</p>
              </div>
            </div>
            
            {selectedRecommendation?.empathic_message && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Mensaje Empático</p>
                <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded">
                  "{selectedRecommendation.empathic_message}"
                </p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Perfil del Empleado (Anónimo)</p>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                Edad: {selectedRecommendation?.profile_snapshot?.ageCategory || 'No especificado'}<br/>
                Intereses: {selectedRecommendation?.profile_snapshot?.hobbies?.join(', ') || 'No especificado'}<br/>
                Metas: {selectedRecommendation?.profile_snapshot?.goals?.join(', ') || 'No especificado'}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-foreground">Impacto Estimado en Productividad</p>
              <p className="text-sm text-muted-foreground">+{selectedRecommendation?.estimated_productivity_uplift_percent || 15}%</p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleReject}>
              <X className="h-4 w-4 mr-2" />
              No, Rechazar
            </Button>
            <Button onClick={handleApprove}>
              <Check className="h-4 w-4 mr-2" />
              Sí, Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={resultDialog.open} onOpenChange={closeResultDialog}>
        <DialogContent className="text-center">
          <div className="flex flex-col items-center py-6">
            {resultDialog.approved ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <DialogTitle className="text-xl mb-2">Recomendación Aprobada</DialogTitle>
                <DialogDescription>
                  El presupuesto ha sido asignado correctamente.
                </DialogDescription>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <DialogTitle className="text-xl mb-2">Recomendación Rechazada</DialogTitle>
                <DialogDescription>
                  La petición ha sido descartada.
                </DialogDescription>
              </>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={closeResultDialog}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </RouteGuard>
  );
};

export default Dashboard;
