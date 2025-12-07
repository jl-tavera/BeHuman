import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CrisisAlert {
  id: string;
  anonymous_token: string;
  situation_type: string;
  severity: 'critical' | 'severe' | 'moderate';
  created_at: string;
  transcript_excerpt: string;
  emotional_indicators?: {
    desperation: number;
    hopelessness: number;
    anxiety: number;
    depression: number;
  };
  risk_factors: string[];
  priority: 'urgent' | 'high' | 'medium' | 'low';
  needs_immediate_attention: boolean;
}

interface CrisisAlertPanelProps {
  onAlertClick: (alert: CrisisAlert) => void;
}

export function CrisisAlertPanel({ onAlertClick }: CrisisAlertPanelProps) {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrisisAlerts();
  }, []);

  const fetchCrisisAlerts = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockAlerts: CrisisAlert[] = [
        {
          id: '1',
          anonymous_token: 'anon_crisis_001',
          situation_type: 'emotional_distress',
          severity: 'critical',
          created_at: new Date().toISOString(),
          transcript_excerpt: 'No puedo más... estoy pensando en acabar con todo...',
          emotional_indicators: {
            desperation: 95,
            hopelessness: 90,
            anxiety: 80,
            depression: 85
          },
          risk_factors: ['suicidal_ideation', 'social_isolation', 'financial_stress'],
          priority: 'urgent',
          needs_immediate_attention: true
        },
        {
          id: '2', 
          anonymous_token: 'anon_crisis_002',
          situation_type: 'rompimiento_pareja',
          severity: 'severe',
          created_at: new Date(Date.now() - 30 * 60000).toISOString(),
          transcript_excerpt: 'Rompí con mi novia y no sé cómo seguir. Todo me recuerda a ella...',
          emotional_indicators: {
            desperation: 70,
            hopelessness: 65,
            anxiety: 75,
            depression: 80
          },
          risk_factors: ['relationship_issues', 'social_isolation'],
          priority: 'high',
          needs_immediate_attention: true
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching crisis alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'severe':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '📋';
      default:
        return '💡';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - alertTime.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-5 w-5" />
            Crisis Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No crisis alerts at this time. All employees are emotionally stable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-200 bg-orange-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertTriangle className="h-5 w-5" />
          Crisis Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${getSeverityColor(alert.severity)}`}
            onClick={() => onAlertClick(alert)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getPriorityIcon(alert.priority)}</span>
                <Badge variant="outline" className="uppercase text-xs font-bold">
                  {alert.severity}
                </Badge>
                {alert.needs_immediate_attention && (
                  <Badge className="bg-red-600 text-white text-xs animate-pulse">
                    URGENT
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(alert.created_at)}
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm font-medium mb-1">
                Anonymous Employee ({alert.anonymous_token.slice(-6)})
              </p>
              <p className="text-xs text-muted-foreground italic">
                "{alert.transcript_excerpt.length > 80 ? 
                  alert.transcript_excerpt.substring(0, 80) + '...' : 
                  alert.transcript_excerpt}"
              </p>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {alert.risk_factors.slice(0, 3).map((risk) => (
                <Badge key={risk} variant="secondary" className="text-xs">
                  {risk.replace('_', ' ')}
                </Badge>
              ))}
            </div>

            {alert.emotional_indicators && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Desperation: {alert.emotional_indicators.desperation}%</div>
                <div>Hopelessness: {alert.emotional_indicators.hopelessness}%</div>
                <div>Anxiety: {alert.emotional_indicators.anxiety}%</div>
                <div>Depression: {alert.emotional_indicators.depression}%</div>
              </div>
            )}
            
            <div className="mt-3 pt-2 border-t border-current/20">
              <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                Review Crisis Alert
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}