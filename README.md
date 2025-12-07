🌿 Wellness Recommendation & HR Approval System
AI-Powered Wellness Recommendations + Anonymous HR Review + Budget Control
This repository implements an end-to-end system that connects employees' emotional situations with personalized Compensar wellness activities, stores the request anonymously, and allows HR admins to approve or reject recommendations under a controlled budget.
This README contains all critical documentation: architecture, database schema, features, flows, and integration examples. No need for separate docs.

📌 1. What This System Does
This system allows BeHuman to automatically:


Detect emotional situations in chat conversations


Recommend Compensar wellness products based on profile, situation, and scoring


Store a wellness request anonymously


Expose an admin dashboard so HR can approve/reject


Manage a wellness budget with real-time deduction


Notify employees anonymously when a request is approved


Everything is fully integrated with Supabase, Next.js, and TypeScript.

🌟 2. Main Features
🧠 Automatic Situation Classification
Detects 4 categories:


💔 Breakup


🕊️ Family loss


💰 Economic stress


🔒 Blocked/incapable


Classification uses keyword heuristics tuned for Colombian context.

🎯 Recommendation Engine
Matches:


Age group (young/adult/older)


Hobbies


Personal goals


Emotional situation


Price constraints


Produces:


Best product


Reasoning


Empathic message


Full product snapshot stored for auditing



🗂️ Admin Dashboard (/admin/dashboard)
Admins can:


View pending/approved/rejected requests


Review anonymous employee profiles


Approve or reject with one click


Track budget in real time


See expected productivity uplift



💵 Budget Management


Period-based budgeting (monthly/quarterly)


Prevents over-budget approvals


Logs allocated & spent amounts


Calculated at approval time



🔐 Privacy First


Employees identified only by anonymous_token


RLS policies ensuring admin-only access


System writes allowed via service key



🧱 3. System Architecture (Overview)
Chat → Situation Classifier → Recommendation Engine → Save Request
                                       ↓
                          Admin Dashboard (HR)
                                       ↓
                             Budget Deduction
                                       ↓
                        Anonymous Employee Notification


🗄️ 4. Database Schema (Supabase)
4.1 wellness_requests
Stores every recommendation request.
Key fields:


anonymous_token


situation_type


profile_snapshot


recommended_product_*


product_snapshot


recommendation_score


status (pending, approved, rejected)


budget_allocated


Includes full RLS setup for admin-only read/update.

4.2 admin_budget
Tracks:


total_budget


allocated_budget


spent_budget


Period start/end


Used to prevent approvals above available budget.

4.3 employee_notifications
Anonymous notifications created after approval.

🛠️ 5. API Routes
RouteDescription/api/recommendationsGenerates a recommendation + saves request/api/wellness/requestsFetch or create wellness requests/api/wellness/approveApprove request + deduct budget/api/wellness/rejectReject request/api/wellness/budgetGet/set current budget
All routes use server-side Supabase (service role when necessary).

🧩 6. TypeScript Integration
Key files:


supabaseClient.ts – DB client + wellness helpers


types.ts – Strongly typed entities


recommender.ts – Classification, scoring, saving


profile-adapter.ts – Converts onboarding → internal Profile


test-wellness-system.ts – Standalone test



🧪 7. Quick Test
npm run dev

Then:


Chat about a situation


See recommendation card


Go to /admin/dashboard


Approve or reject


Verify budget is updated


Employee receives anonymous notification



🧭 8. Example Workflow
Employee message:

“Rompí con mi novia y no puedo concentrarme…”

System:


Classifies as rompimiento_pareja


Profile: 19M, likes sports, wants social life


Recommends “Basketball Team Building — $10”


Saves pending request


Shows empathic message


HR Dashboard:


Shows situation, reasoning, budget impact


Approve → budget-deducted + employee notified



👩‍💻 9. How to Integrate into Your Chat
import { useRecommendation } from '@/hooks/use-recommendation';

export function ChatInterface() {
  const { getRecommendation, shouldTriggerRecommendation, lastRecommendation } =
    useRecommendation({ profile: userProfile });

  const handleMessage = async (msg: string) => {
    if (shouldTriggerRecommendation(msg)) {
      await getRecommendation(fullTranscript, anonymousToken);
    }
  };

  return (
    <>
      {lastRecommendation && (
        <RecommendationCard result={lastRecommendation} />
      )}
    </>
  );
}


🧠 10. Compensar Product Requirements
Each product must include:
Required fields


nombre


precio_desde


categoria_principal


Required tags


situation_tags:
muerte_familiar, causa_economica, bloqueo_incapacidad, rompimiento_pareja


Optional (recommended)


profile_tags: joven, musica, deportes, social, tech, etc.



🛡️ 11. Security Model


Anonymous tokens instead of user IDs


RLS:


Admins can read/update


Service key can insert




Dashboard requires role = admin


No personal data ever displayed



🧭 12. Troubleshooting
❌ No recommendations?


Compensar DB missing tags


Missing hobbies/goals


Check console errors


❌ Budget not updating?


Wrong period in admin_budget


RLS blocking service-key updates


❌ Dashboard empty?


User missing admin role


Wrong Supabase project or keys



📈 13. Future Enhancements


Email/SMS notifications


Analytics dashboard


Budget forecasting


Feedback loop


A/B testing



✔️ 14. Setup Checklist


 .env.local configured


 Tables created


 Budget initialized


 Products inserted


 Dashboard accessible


 Tests passed



📜 License
Same as BeHuman project.

If you want, I can also:
✅ Convert this README into Spanish
✅ Create a short version for GitHub
✅ Auto-generate your database SQL file
✅ Generate a diagram (Mermaid)
✅ Create a CHANGELOG.md
Just tell me.