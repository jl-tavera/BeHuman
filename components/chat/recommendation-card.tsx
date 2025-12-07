'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RecommendationResult } from '@/Typescript-Integration/types';

interface RecommendationCardProps {
  result: RecommendationResult;
  onDismiss?: () => void;
}

export function RecommendationCard({ result, onDismiss }: RecommendationCardProps) {
  const topRecommendation = result.recommendations[0];

  if (!topRecommendation) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSituationEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      rompimiento_pareja: '💔',
      muerte_familiar: '🕊️',
      causa_economica: '💰',
      bloqueo_incapacidad: '🔒'
    };
    return emojis[type] || '💙';
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSituationEmoji(result.situation.type)}</span>
            <div>
              <CardTitle className="text-lg">BeHuman te comprende</CardTitle>
              <CardDescription>
                Hemos detectado que estás pasando por un momento difícil
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Empathic Message */}
        {result.empathicMessage && (
          <div className="bg-white/80 p-4 rounded-lg border border-blue-100">
            <p className="text-sm italic text-gray-700">{result.empathicMessage}</p>
          </div>
        )}

        {/* Top Recommendation */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {topRecommendation.product.nombre}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {topRecommendation.product.categoria_principal} • {topRecommendation.product.subcategoria}
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50">
              {formatCurrency(topRecommendation.product.precio_desde)}
            </Badge>
          </div>

          {topRecommendation.product.descripcion && (
            <p className="text-sm text-gray-600 mb-3">
              {topRecommendation.product.descripcion}
            </p>
          )}

          {/* Reasons */}
          {topRecommendation.reasons && topRecommendation.reasons.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                ¿Por qué te lo recomendamos?
              </p>
              <ul className="space-y-1">
                {topRecommendation.reasons.slice(0, 2).map((reason, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-blue-500">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topRecommendation.product.url && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(topRecommendation.product.url, '_blank')}
            >
              Ver más información →
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-blue-100/50 p-3 rounded-lg">
          <p className="text-xs text-gray-700">
            <strong>💡 Tu empresa se preocupa por ti:</strong> Esta recomendación ha sido enviada al
            departamento de Recursos Humanos para su consideración. Recibirás una notificación si es
            aprobada.
          </p>
        </div>

        {/* Other Recommendations */}
        {result.recommendations.length > 1 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900 font-medium">
              Ver {result.recommendations.length - 1} recomendación
              {result.recommendations.length - 1 > 1 ? 'es' : ''} más
            </summary>
            <div className="mt-2 space-y-2">
              {result.recommendations.slice(1).map((rec, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                  <p className="font-medium">{rec.product.nombre}</p>
                  <p className="text-gray-600">{formatCurrency(rec.product.precio_desde)}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
