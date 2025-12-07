# 🎯 Wellness Recommendation System with Admin Approval

This PR implements a complete wellness recommendation and approval system that connects employee emotional situations with Compensar wellness activities, includes budget management, and provides an admin dashboard for HR approvals.

## 🌟 Features

### 1. **Intelligent Situation Classification**
- Automatically detects 4 main emotional situations from chat transcripts:
  - 💔 Ruptura de pareja (Breakup)
  - 🕊️ Muerte familiar (Family loss)
  - 💰 Causa económica (Economic stress)
  - 🔒 Bloqueo/incapacidad (Feeling incapable)

### 2. **Smart Recommendation Engine**
- Matches employee profile (age, hobbies, goals) with Compensar wellness activities
- Scoring algorithm considers:
  - Situation-specific tags
  - User hobbies and interests
  - Age appropriateness
  - Personal goals alignment
  - Price accessibility
- Generates empathic personalized messages

### 3. **Admin Dashboard** (`/admin/dashboard`)
- View pending wellness requests
- Budget tracking and management
- Approve/reject requests with one click
- Anonymous employee profiles (privacy-first)
- Real-time budget updates

### 4. **Budget Management**
- Set monthly/quarterly wellness budgets
- Automatic deduction on approval
- Visual budget tracking
- Prevent over-budget approvals

### 5. **Anonymous Notifications**
- Employees receive approval notifications
- Privacy-protected (anonymous tokens)
- No personal data exposed to HR

## 📁 Files Added/Modified

### New Files

**Database Schema:**
- `WELLNESS_DATABASE_GUIDE.md` - Complete database setup guide
- `WELLNESS_SYSTEM_GUIDE.md` - Integration and usage guide

**TypeScript Integration:**
- `Typescript-Integration/supabaseClient.ts` - Added wellness request functions
- `Typescript-Integration/types.ts` - Added wellness request types
- `Typescript-Integration/recommender.ts` - Updated to save to database
- `Typescript-Integration/test-wellness-system.ts` - Test script

**API Routes:**
- `app/api/recommendations/route.ts` - Generate recommendations
- `app/api/wellness/requests/route.ts` - Get/create wellness requests
- `app/api/wellness/approve/route.ts` - Approve requests
- `app/api/wellness/reject/route.ts` - Reject requests
- `app/api/wellness/budget/route.ts` - Budget management

**UI Components:**
- `app/admin/dashboard/page.tsx` - Admin dashboard
- `components/chat/recommendation-card.tsx` - Display recommendations in chat
- `hooks/use-recommendation.tsx` - React hook for recommendations

## 🚀 Quick Start

### 1. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```sql
-- Copy from WELLNESS_DATABASE_GUIDE.md
-- Creates 3 tables:
-- - wellness_requests
-- - admin_budget  
-- - employee_notifications
```

### 2. Set Initial Budget

```sql
INSERT INTO public.admin_budget (period_start, period_end, total_budget)
VALUES ('2024-12-01', '2024-12-31', 400.00);
```

### 3. Environment Variables

Ensure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key
```

### 4. Test the System

```bash
npm run dev
```

Then:
1. Navigate to `/admin/dashboard` to see the admin panel
2. Use the chat to trigger a recommendation
3. Check the dashboard for pending requests
4. Approve/reject requests

## 💡 Example Usage

### Scenario: 19M Employee Breakup

**Employee chats with BeHuman:**
```
"I broke up with my girlfriend last week. I can't focus on work. 
We used to play basketball with friends on weekends, but now I 
just stay home alone. I feel like I've ruined my productive days."
```

**System Response:**
1. ✅ Classifies situation: `rompimiento_pareja` (breakup)
2. ✅ Analyzes profile: 19M, hobbies: deportes, goals: amigos, salud
3. ✅ Recommends: "Basketball Team Building - $10"
   - Reasoning: Team sport, builds friendships, shifts focus from relationship
4. ✅ Saves wellness request to database (status: pending)
5. ✅ Shows empathic message to employee

**HR Admin sees in dashboard:**
```
💔 Ruptura de Pareja
Basketball Team Building Package - $10

Profile (Anonymous):
- Age: 19M
- Hobbies: deportes, musica
- Goals: amigos, salud

Why recommended:
✓ Team sport helps build social connections
✓ Physical activity reduces stress
✓ Matches interest in deportes

Budget: $390 remaining (of $400)
Estimated productivity uplift: +15%

[✓ Aprobar] [✗ Rechazar]
```

**Admin approves → Employee receives:**
```
¡Buenas noticias! 🎉

Tu empresa ha aprobado tu solicitud de bienestar:
Basketball Team Building Package

[Ver detalles] [Marcar como leído]
```

## 🔧 Integration with Chat

Add to your chat component:

```typescript
import { useRecommendation } from '@/hooks/use-recommendation';
import { RecommendationCard } from '@/components/chat/recommendation-card';

function ChatInterface() {
  const { getRecommendation, shouldTriggerRecommendation, lastRecommendation } = 
    useRecommendation({ profile: userProfile });

  const handleMessage = async (message: string) => {
    if (shouldTriggerRecommendation(message)) {
      await getRecommendation(fullTranscript, anonymousToken);
    }
  };

  return (
    <div>
      {/* Chat messages */}
      {lastRecommendation && <RecommendationCard result={lastRecommendation} />}
    </div>
  );
}
```

## 📊 Database Schema

### `wellness_requests` Table
Stores each wellness recommendation request from employees.

**Key Fields:**
- `anonymous_token` - Privacy-protected employee identifier
- `situation_type` - Classified emotional situation
- `recommended_product_*` - Product details
- `status` - pending/approved/rejected
- `budget_allocated` - Amount allocated when approved

### `admin_budget` Table  
Tracks wellness budget by period.

**Key Fields:**
- `total_budget` - Total budget for period
- `allocated_budget` - Amount allocated to approvals
- `spent_budget` - Amount actually spent

### `employee_notifications` Table
Anonymous notifications for employees.

**Key Fields:**
- `anonymous_token` - Links to employee
- `wellness_request_id` - Links to approved request
- `delivered` / `read` - Delivery status

## 🎨 UI Components

### Admin Dashboard
- **Budget Card**: Visual budget tracker with percentage bars
- **Filter Buttons**: pending/approved/rejected/all
- **Request Cards**: Full details with approve/reject actions
- **Anonymous Profiles**: Shows age, hobbies, goals without identity

### Recommendation Card (Chat)
- **Empathic Message**: Personalized message for employee
- **Product Details**: Name, price, description
- **Reasoning**: Why this recommendation fits
- **Additional Recommendations**: Collapsible list

## 🔐 Security & Privacy

- ✅ Anonymous tokens instead of user IDs
- ✅ Row Level Security policies on all tables
- ✅ Admin-only access to wellness requests
- ✅ Service role for system operations
- ✅ No personal data exposed in admin dashboard

## 📈 Future Enhancements

- [ ] Email notifications for approvals
- [ ] SMS notifications option
- [ ] Analytics dashboard (trends, popular activities)
- [ ] Budget forecasting
- [ ] Employee feedback loop
- [ ] A/B testing for recommendations
- [ ] Integration with HR systems
- [ ] Multi-language support

## 🧪 Testing

Run the test script:

```bash
# Using ts-node
npx ts-node Typescript-Integration/test-wellness-system.ts

# Or add to package.json:
# "test:wellness": "ts-node Typescript-Integration/test-wellness-system.ts"
npm run test:wellness
```

The test will:
1. ✅ Classify a test situation
2. ✅ Generate recommendations
3. ✅ Save wellness request to database
4. ✅ Check budget status
5. ✅ Simulate HR approval
6. ✅ Verify budget was updated

## 📚 Documentation

- `WELLNESS_DATABASE_GUIDE.md` - Complete database schema and setup
- `WELLNESS_SYSTEM_GUIDE.md` - Integration guide with examples
- `Typescript-Integration/types.ts` - Type definitions and documentation
- `Typescript-Integration/recommender.ts` - Recommendation algorithm explained

## 🤝 Contributing

When adding new wellness activities to Compensar database:

1. **Required fields:**
   - `nombre` - Activity name
   - `precio_desde` - Starting price
   - `categoria_principal` - Main category
   - `subcategoria` - Subcategory

2. **Tags (critical for matching):**
   - `profile_tags` - e.g., ["joven", "deportes", "social"]
   - `situation_tags` - e.g., ["rompimiento_pareja", "bloqueo_incapacidad"]

3. **Best practices:**
   - Use specific tags for better matching
   - Price products affordably
   - Include clear descriptions
   - Add URL for more information

## 🐛 Troubleshooting

**Recommendations not generating:**
- Check Compensar database has products with `situation_tags`
- Verify profile has hobbies and goals
- Check browser console for errors

**Budget not updating:**
- Verify trigger is installed in Supabase
- Check `admin_budget` table has current period
- Review RLS policies

**Admin dashboard not loading:**
- Ensure user has `role: 'admin'` in `user_metadata`
- Check RLS policies on `wellness_requests` table
- Verify Supabase URL/keys in environment

## 📝 License

Same as BeHuman project.

---

**Ready to help employees find wellness through empathy and smart recommendations! 💙**
