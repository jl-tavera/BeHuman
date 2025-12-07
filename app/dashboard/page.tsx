"use client";

import { useState, useEffect } from "react";
import { Check, X, ChevronRight } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import PuzzleAreaCards from "@/components/dashboard/PuzzleAreaCards";
import TrendChart from "@/components/dashboard/TrendChart";
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
  getTrendData,
  getDashboardMetrics,
  type AreaData,
  type TrendData,
  type DashboardMetrics,
} from "./actions";

// Fallback data for when database is empty
const fallbackAreasData: AreaData[] = [
  { name: "Marketing", data: { stress: 72, emotion: 39, anxiety: 61 } },
  { name: "Recursos Humanos", data: { stress: 54, emotion: 71, anxiety: 48 } },
  { name: "Operación", data: { stress: 78, emotion: 55, anxiety: 65 } },
  { name: "Ventas", data: { stress: 65, emotion: 60, anxiety: 52 } },
];

const fallbackTrendData: TrendData = {
  general: [
    { month: "Q1", value: 70 },
    { month: "Q2", value: 65 },
    { month: "Q3", value: 60 },
    { month: "Q4", value: 55 },
  ],
};

interface PendingRecommendation {
  id: string;
  title: string;
  area: string;
  cost: number;
  priority: "alta" | "media" | "baja";
}

const pendingRecommendations: PendingRecommendation[] = [
  {
    id: "1",
    title: "Paquete para ir a lago sol",
    area: "Marketing",
    cost: 100,
    priority: "media",
  },
];

const priorityColors = {
  alta: "bg-red-100 text-red-700 border-red-200",
  media: "bg-amber-100 text-amber-700 border-amber-200",
  baja: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const Dashboard = () => {
  // Data state
  const [areasData, setAreasData] = useState<AreaData[]>(fallbackAreasData);
  const [stressTrendData, setStressTrendData] = useState<TrendData>(fallbackTrendData);
  const [emotionTrendData, setEmotionTrendData] = useState<TrendData>(fallbackTrendData);
  const [anxietyTrendData, setAnxietyTrendData] = useState<TrendData>(fallbackTrendData);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    generalStress: 0,
    anxietyInterventions: 0,
    criticalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Budget state
  const [monthlyBudget] = useState(5000);
  const [availableBudget, setAvailableBudget] = useState(5000);
  const [recommendations, setRecommendations] = useState(pendingRecommendations);
  const [approvedByArea, setApprovedByArea] = useState<Record<string, number>>({
    "Marketing": 0,
    "Recursos Humanos": 0,
    "Operaciones": 0,
    "Ventas": 0,
    "Toda la empresa": 0,
  });
  const [selectedRecommendation, setSelectedRecommendation] = useState<PendingRecommendation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<{ open: boolean; approved: boolean }>({ open: false, approved: false });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [areas, trends, dashboardMetrics] = await Promise.all([
          getAreaBasedMetrics(),
          getTrendData(),
          getDashboardMetrics(),
        ]);

        if (areas.length > 0) {
          setAreasData(areas);
        }

        if (trends.stress.general.length > 0) {
          setStressTrendData(trends.stress);
          setEmotionTrendData(trends.emotion);
          setAnxietyTrendData(trends.anxiety);
        }

        setMetrics(dashboardMetrics);
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

  const handleRowClick = (rec: PendingRecommendation) => {
    setSelectedRecommendation(rec);
    setDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedRecommendation) {
      setAvailableBudget(prev => prev - selectedRecommendation.cost);
      setApprovedByArea(prev => ({
        ...prev,
        [selectedRecommendation.area]: (prev[selectedRecommendation.area] || 0) + selectedRecommendation.cost
      }));
      setRecommendations(prev => prev.filter(r => r.id !== selectedRecommendation.id));
      setDialogOpen(false);
      setResultDialog({ open: true, approved: true });
    }
  };

  const handleReject = () => {
    if (selectedRecommendation) {
      setRecommendations(prev => prev.filter(r => r.id !== selectedRecommendation.id));
      setDialogOpen(false);
      setResultDialog({ open: true, approved: false });
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

      {/* Trend Chart */}
      <div className="mb-8">
        <TrendChart
          metrics={[
            {
              key: "stress",
              label: "Estrés",
              color: "hsl(0, 70%, 50%)",
              isPercentage: true,
              data: stressTrendData,
            },
            {
              key: "emotion",
              label: "Estado emocional",
              color: "hsl(142, 70%, 45%)",
              isPercentage: false,
              data: emotionTrendData,
            },
            {
              key: "anxiety",
              label: "Ansiedad",
              color: "hsl(45, 90%, 50%)",
              isPercentage: true,
              data: anxietyTrendData,
            },
          ]}
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
                        <TableCell className="font-medium">{rec.title}</TableCell>
                        <TableCell>{rec.area}</TableCell>
                        <TableCell>${rec.cost.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityColors[rec.priority]}>
                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Presupuesto</DialogTitle>
            <DialogDescription>
              ¿Deseas aprobar el presupuesto para "{selectedRecommendation?.title}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Costo: <span className="font-semibold text-foreground">${selectedRecommendation?.cost.toLocaleString()}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Área: <span className="font-semibold text-foreground">{selectedRecommendation?.area}</span>
            </p>
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
