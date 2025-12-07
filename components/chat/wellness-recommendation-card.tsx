/**
 * Wellness Recommendation Card Component
 * Displays recommendation when emotional distress is detected in chat
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, DollarSign, TrendingUp, Clock } from 'lucide-react';
import type { RecommendationResult } from '@/Typescript-Integration/types';

interface WellnessRecommendationCardProps {
  result: RecommendationResult;
  onClose?: () => void;
}

const situationEmojis = {
  muerte_familiar: '🕊️',
  rompimiento_pareja: '💔',
  causa_economica: '💰',
  bloqueo_incapacidad: '🔒'
};

const situationLabels = {
  muerte_familiar: 'Pérdida Familiar',
  rompimiento_pareja: 'Ruptura de Pareja', 
  causa_economica: 'Estrés Económico',
  bloqueo_incapacidad: 'Sentirse Incapaz'
};

export function WellnessRecommendationCard({ result, onClose }: WellnessRecommendationCardProps) {
  const topRecommendation = result.recommendations[0];
  
  if (!topRecommendation || !result.situation) {
    return null;
  }

  const situationType = result.situation.type as keyof typeof situationEmojis;
  const emoji = situationEmojis[situationType] || '🌟';
  const label = situationLabels[situationType] || 'Situación Detectada';

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <div>
              <CardTitle className="text-lg text-primary">BeHuman te comprende</CardTitle>
              <CardDescription>Hemos detectado que podrías necesitar apoyo</CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Situation Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Confianza: {Math.round((result.situation.confidence || 0) * 100)}%
          </span>
        </div>

        {/* Empathic Message */}
        {result.empathicMessage && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm italic text-muted-foreground">
              "{result.empathicMessage}"
            </p>
          </div>
        )}

        {/* Top Recommendation */}
        <div className="border rounded-lg p-3 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{topRecommendation.product.nombre}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {topRecommendation.product.descripcion}
              </p>
            </div>
          </div>

          {/* Recommendation Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="text-muted-foreground">Costo:</span>
              <span className="font-medium">${topRecommendation.product.precio_desde.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span className="text-muted-foreground">Puntaje:</span>
              <span className="font-medium">{topRecommendation.score}/100</span>
            </div>
          </div>

          {/* Why this recommendation */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">¿Por qué esta recomendación?</p>
            <div className="flex flex-wrap gap-1">
              {topRecommendation.reasons.slice(0, 3).map((reason, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2">
          <Clock className="h-3 w-3" />
          <span>
            Tu solicitud ha sido enviada a Recursos Humanos para aprobación. 
            Recibirás una notificación cuando sea revisada.
          </span>
        </div>

        {/* Other recommendations count */}
        {result.recommendations.length > 1 && (
          <p className="text-xs text-center text-muted-foreground">
            + {result.recommendations.length - 1} recomendaciones adicionales enviadas a HR
          </p>
        )}
      </CardContent>
    </Card>
  );
}