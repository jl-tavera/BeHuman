# BeHuman Wellness Recommendation System - Complete Setup Guide

## Overview

This system automatically detects employee emotional distress through chat conversations, recommends wellness activities from the Compensar database, and presents them to HR admins for budget approval.

## System Flow

```
1. Employee chats with BeHuman → "I broke up with my girlfriend and I'm not productive"
2. System detects emotional situation → Classification: "rompimiento_pareja" 
3. Recommender matches profile + situation → Finds: "Basketball package - $10"
4. Wellness request saved to database → Status: "pending"
5. HR admin sees in dashboard → Budget available: $400
6. HR approves request → Deducts $10 from budget
7. Anonymous notification sent → Employee receives wellness approval
```

## Database Setup

### Step 1: Run SQL Schema in Supabase

Open your Supabase SQL Editor and run the complete schema from `WELLNESS_DATABASE_GUIDE.md`:

```sql
-- 1. Create wellness_requests table
-- 2. Create admin_budget table  
-- 3. Create employee_notifications table
-- 4. Create triggers for budget updates
-- 5. Insert initial budget
```

### Step 2: Verify Compensar Database

Ensure your `Compensar-Database` table has these fields:
- `id` (string)
- `nombre` (string)
- `descripcion` (string)
- `precio_desde` (number)
- `categoria_principal` (string)
- `subcategoria` (string)
- `url` (string)
- `profile_tags` (array of strings) - e.g., ["joven", "deportes", "social"]
- `situation_tags` (array of strings) - e.g., ["rompimiento_pareja", "bloqueo_incapacidad"]

### Step 3: Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

## Usage Examples

### Example 1: Employee Chat Triggers Recommendation

```typescript
// In your chat interface component
import { useRecommendation } from '@/hooks/use-recommendation';
import { RecommendationCard } from '@/components/chat/recommendation-card';

function ChatInterface() {
  const userProfile = {
    userId: 'user-123',
    name: 'Carlos',
    age: 19,
    gender: 'masculino',
    hobbies: ['deportes', 'musica', 'tech'],
    goals: ['amigos', 'salud', 'crecimiento_personal']
  };

  const { 
    getRecommendation, 
    shouldTriggerRecommendation, 
    lastRecommendation 
  } = useRecommendation({ 
    profile: userProfile 
  });

  const handleMessage = async (message: string) => {
    // Check if message contains emotional distress
    if (shouldTriggerRecommendation(message)) {
      // Get full conversation history
      const conversationTranscript = getFullTranscript();
      
      // Get recommendation
      await getRecommendation(conversationTranscript, 'anon_user_123');
    }
  };

  return (
    <div>
      {/* Chat messages */}
      
      {/* Show recommendation if detected */}
      {lastRecommendation && (
        <RecommendationCard result={lastRecommendation} />
      )}
    </div>
  );
}
```

### Example 2: Direct API Call

```typescript
// Example: 19-year-old male broke up with girlfriend

const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcript: `Terminé con mi novia hace una semana y no puedo concentrarme en nada.
                 Me siento solo y como si hubiera arruinado mis días productivos.
                 Solía salir con amigos pero ahora no tengo ganas de nada.`,
    profile: {
      userId: 'emp-456',
      name: 'Anonymous',
      age: 19,
      gender: 'masculino',
      hobbies: ['deportes', 'videojuegos', 'musica'],
      goals: ['amigos', 'carrera', 'salud']
    },
    anonymousToken: 'anon_emp_456_2024'
  })
});

const data = await response.json();

// Result:
// {
//   success: true,
//   data: {
//     situation: {
//       type: 'rompimiento_pareja',
//       subtype: 'general',
//       confidence: 0.9
//     },
//     recommendations: [
//       {
//         product: {
//           nombre: 'Paquete de Basketball - Team Building',
//           precio_desde: 10,
//           categoria_principal: 'Deportes',
//           profile_tags: ['joven', 'deportes', 'social', 'amigos']
//         },
//         score: 85,
//         reasons: [
//           'Recomendado específicamente para tu situación',
//           'Actividad de tipo social ayuda en tu situación',
//           'Conecta con tu interés en deportes'
//         ]
//       }
//     ],
//     empathicMessage: 'Carlos, sé que hoy te toca levantarte después de una ruptura...'
//   }
// }
```

### Example 3: HR Admin Approves Request

1. **HR logs into admin dashboard**: `/admin/dashboard`

2. **Sees pending request**:
   ```
   💔 Ruptura de Pareja
   Basketball Package - $10
   
   Profile: 19M, Hobbies: deportes, musica
   Budget: $390 remaining (of $400)
   Score: 85
   
   Why recommended:
   - Team sport helps build friendships
   - Physical activity reduces stress
   - Shifts focus from relationship to game
   ```

3. **HR clicks "Aprobar"** → System:
   - Updates request status to "approved"
   - Deducts $10 from budget ($390 remaining)
   - Creates notification for employee

4. **Employee receives notification** (anonymous):
   ```
   ¡Buenas noticias! 🎉
   
   Tu empresa ha aprobado tu solicitud de bienestar:
   Basketball Package - Team Building
   
   [View Details] [Mark as Read]
   ```

### Example 4: Budget Management

```typescript
// Set monthly budget
const response = await fetch('/api/wellness/budget', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    totalBudget: 400
  })
});

// Get current budget status
const statusRes = await fetch('/api/wellness/budget');
const budgetData = await statusRes.json();

// Result:
// {
//   total_budget: 400,
//   allocated_budget: 50,
//   spent_budget: 50,
//   remaining: 350
// }
```

## Testing the Complete Flow

### Test Case: 19M Breakup → Basketball Recommendation

```typescript
// 1. Create test profile
const testProfile = {
  userId: 'test-001',
  name: 'TestUser',
  age: 19,
  gender: 'masculino',
  hobbies: ['deportes', 'musica'],
  goals: ['amigos', 'salud']
};

// 2. Simulate distressed chat
const testTranscript = `
  Hola, necesito hablar con alguien.
  Terminé con mi novia hace una semana.
  No puedo concentrarme en el trabajo, siento que arruiné todo.
  Antes salíamos con amigos pero ahora me quedo en casa solo.
`;

// 3. Get recommendation
const recResponse = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcript: testTranscript,
    profile: testProfile,
    anonymousToken: 'test_anon_001'
  })
});

const recData = await recResponse.json();
console.log('✅ Recommendation created:', recData.data.recommendations[0]);

// 4. Check admin dashboard
// Navigate to: http://localhost:3000/admin/dashboard
// Should see pending request

// 5. Get pending requests via API
const requestsRes = await fetch('/api/wellness/requests?status=pending');
const requestsData = await requestsRes.json();
console.log('✅ Pending requests:', requestsData.data.length);

// 6. Approve request
const approvalRes = await fetch('/api/wellness/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestId: requestsData.data[0].id,
    adminUserId: 'admin-001',
    decision: 'approve'
  })
});

const approvalData = await approvalRes.json();
console.log('✅ Request approved:', approvalData.success);

// 7. Verify budget was deducted
const budgetRes = await fetch('/api/wellness/budget');
const budgetData = await budgetRes.json();
console.log('✅ Budget remaining:', budgetData.data.total_budget - budgetData.data.allocated_budget);
```

## Integration Points

### 1. Chat Interface Integration

Add to your existing chat component:

```typescript
import { useRecommendation } from '@/hooks/use-recommendation';
import { RecommendationCard } from '@/components/chat/recommendation-card';

// Inside component:
const { getRecommendation, shouldTriggerRecommendation, lastRecommendation } = 
  useRecommendation({ profile: userProfile });

// On message send:
if (shouldTriggerRecommendation(newMessage)) {
  await getRecommendation(fullTranscript, anonymousToken);
}

// In render:
{lastRecommendation && <RecommendationCard result={lastRecommendation} />}
```

### 2. Admin Dashboard Access

Add route protection to `/app/admin/dashboard/page.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default async function AdminDashboardPage() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/login');
  }
  
  // ... rest of component
}
```

### 3. User Profile Integration

Ensure user profile is available in chat:

```typescript
// Option 1: From onboarding data
const { data: onboarding } = await supabase
  .from('onboarding_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

const profile = {
  userId,
  name: onboarding.human_name,
  age: parseInt(onboarding.human_age),
  gender: onboarding.human_gender,
  hobbies: onboarding.hobbies,
  goals: onboarding.short_term_goals
};

// Option 2: From session/context
const profile = useUserProfile();
```

## Deployment Checklist

- [ ] Run SQL schema in Supabase
- [ ] Populate Compensar database with wellness activities
- [ ] Set environment variables
- [ ] Create admin user with role='admin' in user_metadata
- [ ] Set initial monthly budget
- [ ] Test recommendation flow end-to-end
- [ ] Test admin approval flow
- [ ] Test budget tracking
- [ ] Add authentication to admin dashboard
- [ ] Configure RLS policies for production

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/recommendations` | POST | Generate wellness recommendations |
| `/api/wellness/requests` | GET | Get all wellness requests (filtered) |
| `/api/wellness/requests` | POST | Create wellness request manually |
| `/api/wellness/approve` | POST | Approve a wellness request |
| `/api/wellness/reject` | POST | Reject a wellness request |
| `/api/wellness/budget` | GET | Get current budget status |
| `/api/wellness/budget` | POST | Set/update budget |

## Troubleshooting

### Recommendations not showing
- Check Compensar database has products with `situation_tags`
- Verify profile has hobbies and goals
- Check console for classification results

### Budget not updating
- Verify trigger is created in Supabase
- Check admin_budget table has current period
- Ensure RLS policies allow updates

### Notifications not appearing
- Check employee_notifications table
- Verify anonymous_token matches
- Check RLS policies

## Next Steps

1. Add email notifications for approved requests
2. Implement notification bell in employee interface
3. Add analytics dashboard for HR
4. Create budget forecasting
5. Add A/B testing for recommendations
6. Implement feedback loop for recommendation quality
