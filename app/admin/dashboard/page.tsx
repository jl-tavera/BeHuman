'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { WellnessRequest, AdminBudget } from '@/Typescript-Integration/types';

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<WellnessRequest[]>([]);
  const [budget, setBudget] = useState<AdminBudget | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load requests
      const filterParam = filter === 'all' ? '' : `?status=${filter}`;
      const requestsRes = await fetch(`/api/wellness/requests${filterParam}`);
      const requestsData = await requestsRes.json();
      if (requestsData.success) {
        setRequests(requestsData.data || []);
      }

      // Load budget
      const budgetRes = await fetch('/api/wellness/budget');
      const budgetData = await budgetRes.json();
      if (budgetData.success) {
        setBudget(budgetData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const res = await fetch('/api/wellness/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          adminUserId: 'current-admin-id', // TODO: Get from auth context
          decision: 'approve'
        })
      });

      const data = await res.json();
      if (data.success) {
        loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId: string, reason?: string) => {
    try {
      const res = await fetch('/api/wellness/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          adminUserId: 'current-admin-id', // TODO: Get from auth context
          decision: 'reject',
          reason
        })
      });

      const data = await res.json();
      if (data.success) {
        loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getBudgetColor = () => {
    if (!budget) return 'text-gray-500';
    const percentage = (budget.allocated_budget / budget.total_budget) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Panel de Administración de Bienestar</h1>
        <p className="text-gray-600">Gestiona las solicitudes de bienestar de los empleados</p>
      </div>

      {/* Budget Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Presupuesto de Bienestar</CardTitle>
          <CardDescription>
            Período actual: {budget?.period_start} - {budget?.period_end}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budget ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Presupuesto Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(budget.total_budget)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Asignado</p>
                  <p className={`text-2xl font-bold ${getBudgetColor()}`}>
                    {formatCurrency(budget.allocated_budget)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Disponible</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(budget.total_budget - budget.allocated_budget)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    (budget.allocated_budget / budget.total_budget) * 100 >= 90
                      ? 'bg-red-600'
                      : (budget.allocated_budget / budget.total_budget) * 100 >= 70
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min((budget.allocated_budget / budget.total_budget) * 100, 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No hay presupuesto configurado para el período actual</p>
          )}
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Aprobadas
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Rechazadas
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No hay solicitudes {filter !== 'all' && filter}
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <WellnessRequestCard
              key={request.id}
              request={request}
              onApprove={handleApprove}
              onReject={handleReject}
              availableBudget={budget ? budget.total_budget - budget.allocated_budget : 0}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface WellnessRequestCardProps {
  request: WellnessRequest;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  availableBudget: number;
}

function WellnessRequestCard({ request, onApprove, onReject, availableBudget }: WellnessRequestCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="default">Pendiente</Badge>;
      case 'approved':
        return <Badge className="bg-green-600">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSituationLabel = (type: string) => {
    const labels: Record<string, string> = {
      rompimiento_pareja: '💔 Ruptura de Pareja',
      muerte_familiar: '🕊️ Pérdida Familiar',
      causa_economica: '💰 Causa Económica',
      bloqueo_incapacidad: '🔒 Bloqueo/Incapacidad'
    };
    return labels[type] || type;
  };

  const canAfford = request.recommended_product_price <= availableBudget;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{request.recommended_product_name}</CardTitle>
              {getStatusBadge(request.status)}
            </div>
            <CardDescription>
              {getSituationLabel(request.situation_type)}
              {request.situation_subtype && ` - ${request.situation_subtype}`}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(request.recommended_product_price)}
            </p>
            <p className="text-xs text-gray-500">
              Score: {request.recommendation_score}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Profile Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Perfil del Empleado (Anónimo)</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Edad:</span>{' '}
              {request.profile_snapshot.age || 'No especificada'}
            </div>
            <div>
              <span className="text-gray-600">Género:</span>{' '}
              {request.profile_snapshot.gender || 'No especificado'}
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Hobbies:</span>{' '}
              {request.profile_snapshot.hobbies?.join(', ') || 'Ninguno'}
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Metas:</span>{' '}
              {request.profile_snapshot.goals?.join(', ') || 'Ninguna'}
            </div>
          </div>
        </div>

        {/* Empathic Message */}
        {request.empathic_message && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm italic">{request.empathic_message}</p>
          </div>
        )}

        {/* Recommendation Reasons */}
        {request.recommendation_reasons && request.recommendation_reasons.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm">¿Por qué esta recomendación?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {request.recommendation_reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Productivity Impact */}
        {request.estimated_productivity_uplift_percent && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Impacto estimado en productividad:</span>
            <Badge variant="outline" className="bg-green-50">
              +{request.estimated_productivity_uplift_percent}%
            </Badge>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        {request.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              onClick={() => onApprove(request.id)}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!canAfford}
            >
              ✓ Aprobar
            </Button>
            <Button
              onClick={() => onReject(request.id, 'Presupuesto insuficiente')}
              variant="outline"
              className="flex-1"
            >
              ✗ Rechazar
            </Button>
          </div>
        )}

        {!canAfford && request.status === 'pending' && (
          <p className="text-sm text-red-600 text-center">
            ⚠️ Presupuesto insuficiente - Disponible: {formatCurrency(availableBudget)}
          </p>
        )}

        {/* Review Info */}
        {request.status !== 'pending' && request.reviewed_at && (
          <div className="text-sm text-gray-500">
            {request.status === 'approved' ? 'Aprobada' : 'Rechazada'} el{' '}
            {new Date(request.reviewed_at).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            {request.rejection_reason && (
              <p className="mt-1 text-red-600">Razón: {request.rejection_reason}</p>
            )}
          </div>
        )}

        {/* Transcript Excerpt */}
        {request.transcript_excerpt && (
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
              Ver extracto de conversación
            </summary>
            <p className="mt-2 p-3 bg-gray-50 rounded italic text-gray-700">
              "{request.transcript_excerpt}"
            </p>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
