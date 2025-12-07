# 🌿 BeHuman - Wellness Recommendation & HR Approval System

**AI-Powered Wellness Recommendations + Anonymous HR Review + Budget Control**

This repository implements an end-to-end system that connects employees' emotional situations with personalized Compensar wellness activities, stores the request anonymously, and allows HR admins to approve or reject recommendations under a controlled budget.

**Complete Documentation:** This README contains all critical documentation organized by chapters - architecture, database schema, features, flows, setup, integration examples, and troubleshooting. No need for separate docs.

---

## 📚 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Database Schema & Setup](#database-schema--setup)
5. [API Routes](#api-routes)
6. [TypeScript Integration](#typescript-integration)
7. [Onboarding Data Integration](#onboarding-data-integration)
8. [Situation Classification](#situation-classification)
9. [Compensar Product Requirements](#compensar-product-requirements)
10. [Admin Dashboard](#admin-dashboard)
11. [Integration Guide](#integration-guide)
12. [Testing & Examples](#testing--examples)
13. [Security Model](#security-model)
14. [Troubleshooting](#troubleshooting)
15. [Future Enhancements](#future-enhancements)
16. [Setup Checklist](#setup-checklist)

---

## 1. Overview

### What This System Does

The wellness recommendation system allows BeHuman to automatically:

1. **Detect Emotional Situations** - Analyzes chat conversations to identify psychological distress
2. **Recommend Wellness Activities** - Matches employees with Compensar wellness products based on their profile and situation
3. **Store Requests Anonymously** - Saves recommendations with privacy-first approach using anonymous tokens
4. **HR Admin Dashboard** - Provides interface for HR to review, approve/reject recommendations
5. **Manage Wellness Budget** - Tracks budget and deducts costs when approvals are made
6. **Notify Employees** - Sends anonymous notifications when requests are approved

Everything is fully integrated with **Supabase**, **Next.js**, and **TypeScript**.

### Example Workflow

```
Employee: "Rompí con mi novia y no puedo concentrarme en nada"
    ↓
System detects: rompimiento_pareja (breakup)
    ↓
Recommends: Basketball Team Building ($10)
    ↓
HR Dashboard shows: Anonymous request, budget impact
    ↓
HR approves → Budget deducted ($390 remaining) → Employee notified
```

---

## 2. Features

### 🧠 Automatic Situation Classification

Detects 4 psychological situations with Colombian context awareness:

| Situation | Keywords | Recommendations |
|-----------|----------|-----------------|
| **💔 Rompimiento de Pareja (Breakup)** | rompí, tusa, ex, dejó, corazón roto | Actividades sociales, música, eventos con amigos |
| **🕊️ Muerte Familiar (Family Loss)** | murió, falleció, duelo, funeral, padre/madre | Música reconfortante, ejercicio suave, espacios tranquilos |
| **💰 Causa Económica (Economic Stress)** | dinero, deudas, despido, navidad, no hay pesos | Cursos, asesoría financiera, oportunidades de empleo |
| **🔒 Bloqueo/Incapacidad (Feeling Incapable)** | incapaz, no puedo, no entiendo, bloqueado, Freddy Vega | Mentoría, cursos de Platzi, asesoría con especialistas |

**Keywords are Colombian-context aware** - includes "tusa", "Freddy Vega", "Platzi", "navidad" (December stress in Colombia), etc.

### 🎯 Smart Recommendation Engine

Matches employees using a scoring algorithm that considers:

- **Situation Type** (+40 points) - Does product address the specific situation?
- **Profile Tags** (+25 points) - Match beneficial activities for this situation
- **Age Group** (+20 points) - Is product appropriate for user's age?
- **Hobbies** (+20 points) - Does it connect with user's interests?
- **Goals** (+15 points) - Aligned with personal objectives?
- **Keywords** (+10 points) - Relevant keywords in product
- **Price** (+10 points) - Affordable (< $100,000 COP)
- **Penalties** (-50 points) - Avoid inappropriate activities

**Output includes:**
- Best matching product
- Detailed reasoning for recommendation
- Personalized empathic message
- Full product snapshot for auditing
- Estimated productivity uplift

### 💵 Budget Management

- **Period-based budgeting** - Set monthly/quarterly budgets
- **Real-time tracking** - See allocated vs available budget
- **Prevents over-budget approvals** - Can't approve if insufficient budget
- **Automatic deduction** - Budget updated immediately on approval
- **Visual indicators** - Color-coded budget status (green/yellow/red)

### 🗂️ Admin Dashboard

Access: `/admin/dashboard`

Admins can:
- View pending/approved/rejected requests
- Review anonymous employee profiles (age, hobbies, goals)
- See situation type, reasoning, and recommendation details
- Approve or reject with one click
- Track budget in real-time
- See estimated productivity uplift per approval
- View historical approvals and rejections

### 🔐 Privacy-First Design

- **No personal identification** - Only anonymous tokens used
- **Anonymous profiles** - Shows age category and interests, not names
- **RLS policies** - Row Level Security ensures admin-only access
- **Service key operations** - System recommendations don't require admin auth
- **No data exposure** - Personal information never shown to HR beyond what's needed

---

## 3. System Architecture

### High-Level Flow

```
EMPLOYEE CHAT
    ↓
[Situation Classifier]
    ↓
[Recommendation Engine] → Scores Products
    ↓
[Save to Database] → wellness_requests (status: pending)
    ↓
EMPLOYEE SEES
    └─ Recommendation Card
        └─ Empathic Message
        └─ Top Product Details
        └─ Why It's Recommended
    
    ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    
HR ADMIN DASHBOARD
    ↓
[View Pending Requests] → Anonymous Profile + Situation + Budget
    ↓
[Approve/Reject Decision]
    ├─ APPROVE → Budget Deduction → Employee Notification
    └─ REJECT  → Status Updated → Optional Reason Logged
```

### Component Interactions

```typescript
// Chat Interface
useRecommendation() 
  → detects distress keywords
  → calls /api/recommendations
  → displays RecommendationCard
  
// API Layer
/api/recommendations
  → classifySituation() from recommender.ts
  → getRecommendations() with onboarding profile
  → createWellnessRequest() to Supabase
  
// Admin Dashboard
/admin/dashboard
  → fetches wellness_requests from Supabase
  → shows pending with budget context
  → POST to /api/wellness/approve or /reject
  → automatic budget update via trigger
  
// Database
wellness_requests
  → stores all recommendations
  → trigger updates admin_budget on approval
  → trigger creates employee_notifications
```

---

## 4. Database Schema & Setup

### 4.1 Create Tables in Supabase

Run the following SQL in your Supabase SQL Editor:

#### Table 1: wellness_requests

```sql
CREATE TABLE public.wellness_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_token VARCHAR(255) NOT NULL,
  situation_type VARCHAR(100) NOT NULL,
  situation_subtype VARCHAR(100),
  situation_context TEXT,
  situation_confidence DECIMAL(3,2),
  profile_snapshot JSONB NOT NULL,
  transcript_excerpt TEXT,
  recommended_product_id VARCHAR(100) NOT NULL,
  recommended_product_name VARCHAR(255) NOT NULL,
  recommended_product_price DECIMAL(10,2) NOT NULL,
  recommended_product_category VARCHAR(100),
  recommended_product_subcategory VARCHAR(100),
  product_snapshot JSONB NOT NULL,
  recommendation_score INTEGER NOT NULL,
  recommendation_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  empathic_message TEXT,
  estimated_productivity_uplift_percent INTEGER DEFAULT 15,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  budget_allocated DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wellness_requests_status ON public.wellness_requests(status);
CREATE INDEX idx_wellness_requests_created_at ON public.wellness_requests(created_at DESC);
CREATE INDEX idx_wellness_requests_anonymous_token ON public.wellness_requests(anonymous_token);

ALTER TABLE public.wellness_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view wellness requests"
  ON public.wellness_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Service role can insert wellness requests"
  ON public.wellness_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update wellness requests"
  ON public.wellness_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

#### Table 2: admin_budget

```sql
CREATE TABLE public.admin_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_budget DECIMAL(10,2) NOT NULL,
  allocated_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  spent_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_budget_period UNIQUE(period_start, period_end)
);

CREATE INDEX idx_admin_budget_period ON public.admin_budget(period_start, period_end);

ALTER TABLE public.admin_budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view budget"
  ON public.admin_budget FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage budget"
  ON public.admin_budget FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

#### Table 3: employee_notifications

```sql
CREATE TABLE public.employee_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wellness_request_id UUID NOT NULL REFERENCES public.wellness_requests(id) ON DELETE CASCADE,
  anonymous_token VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  intervention_details JSONB NOT NULL,
  delivered BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_employee_notifications_token ON public.employee_notifications(anonymous_token);
CREATE INDEX idx_employee_notifications_delivered ON public.employee_notifications(delivered);
CREATE INDEX idx_employee_notifications_created_at ON public.employee_notifications(created_at DESC);

ALTER TABLE public.employee_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their notifications"
  ON public.employee_notifications FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert notifications"
  ON public.employee_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Employees can update their notifications"
  ON public.employee_notifications FOR UPDATE
  USING (true);
```

#### Trigger: Auto-Update Budget

```sql
CREATE OR REPLACE FUNCTION update_budget_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE public.admin_budget
    SET 
      allocated_budget = allocated_budget + NEW.recommended_product_price,
      spent_budget = spent_budget + NEW.recommended_product_price,
      updated_at = NOW()
    WHERE 
      period_start <= CURRENT_DATE 
      AND period_end >= CURRENT_DATE;
    
    NEW.budget_allocated = NEW.recommended_product_price;
    NEW.reviewed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_on_approval
  BEFORE UPDATE ON public.wellness_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_on_approval();
```

### 4.2 Initialize Budget

```sql
INSERT INTO public.admin_budget (period_start, period_end, total_budget)
VALUES (
  DATE_TRUNC('month', CURRENT_DATE),
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE,
  400.00  -- $400 COP or adjust as needed
);
```

### 4.3 Environment Configuration

Create `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://nfqvhtalwdoxpiqchuxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_KEY=your_service_role_key_here
```

---

## 5. API Routes

All routes are in `app/api/` directory:

### POST /api/recommendations
**Generates a wellness recommendation based on chat transcript**

Request:
```typescript
{
  transcript: string;        // Full chat conversation
  profile: Profile;          // User profile from onboarding
  anonymousToken?: string;   // Optional token for tracking
}
```

Response:
```typescript
{
  success: boolean;
  data: {
    situation: Situation;
    recommendations: ScoredProduct[];
    empathicMessage: string;
    profile: Profile;
    timestamp: string;
  };
  error?: string;
}
```

### GET /api/wellness/requests?status=pending
**Fetch wellness requests (admin dashboard)**

Query Parameters:
- `status`: `pending` | `approved` | `rejected` (optional)

Response:
```typescript
{
  success: boolean;
  data: WellnessRequest[];
}
```

### POST /api/wellness/requests
**Create wellness request manually (usually via /api/recommendations)**

### POST /api/wellness/approve
**Approve a wellness request (HR admin)**

Request:
```typescript
{
  requestId: string;
  adminUserId: string;
  decision: "approve";
}
```

Response:
- Updates request status to `approved`
- Deducts budget automatically (via trigger)
- Creates anonymous notification for employee

### POST /api/wellness/reject
**Reject a wellness request (HR admin)**

Request:
```typescript
{
  requestId: string;
  adminUserId: string;
  decision: "reject";
  reason?: string;
}
```

### GET /api/wellness/budget
**Get current budget status**

Response:
```typescript
{
  success: boolean;
  data: {
    id: string;
    total_budget: number;
    allocated_budget: number;
    spent_budget: number;
    period_start: string;
    period_end: string;
  };
}
```

### POST /api/wellness/budget
**Set/update wellness budget**

Request:
```typescript
{
  periodStart: string;    // "2024-12-01"
  periodEnd: string;      // "2024-12-31"
  totalBudget: number;
}
```

---

## 6. TypeScript Integration

### Key Files

| File | Purpose |
|------|---------|
| `Typescript-Integration/types.ts` | Type definitions (Profile, Situation, WellnessRequest, etc.) |
| `Typescript-Integration/supabaseClient.ts` | Supabase client + database functions |
| `Typescript-Integration/recommender.ts` | Classification, scoring, recommendation generation |
| `Typescript-Integration/profile-adapter.ts` | Converts onboarding data → internal Profile |
| `Typescript-Integration/test-wellness-system.ts` | Standalone testing script |
| `Typescript-Integration/examples.ts` | Example use cases and test scenarios |

### Core Functions

#### Situation Classification

```typescript
import { classifySituation } from '@/Typescript-Integration/recommender';

const situation = classifySituation(chatTranscript);
// Returns: { type, subtype, confidence, context }
```

#### Get Recommendations

```typescript
import { getRecommendations } from '@/Typescript-Integration/recommender';

const result = await getRecommendations(
  profile,           // User profile from onboarding
  situation,         // Classified situation
  transcript,        // Chat transcript
  4,                 // Top N recommendations
  anonymousToken,    // For tracking
  true               // Save to database
);
```

#### Convert Onboarding to Profile

```typescript
import { getProfileFromOnboarding } from '@/Typescript-Integration/profile-adapter';

const profile = await getProfileFromOnboarding(userId);
```

---

## 7. Onboarding Data Integration

The system automatically uses onboarding data to create user profiles:

### Data Mapping

| Onboarding Field | Profile Field | Transformation |
|------------------|---------------|-----------------|
| `human_name` | `name` | Direct |
| `human_age` | `age`, `ageCategory` | Parsed & categorized |
| `human_gender` | `gender` | Direct |
| `hobbies` | `hobbies` | Normalized to tags |
| `life_axes` + `short_term_goals` + `ten_year_goals` | `goals` | Combined & deduplicated |
| `emotional_history` | `emotionalHistory` | Optional field |

### Age Categories

```typescript
type AgeCategory = 'joven' | 'adulto' | 'mayor';

// Ranges:
// joven: 18-29
// adulto: 30-49
// mayor: 50+
```

### Hobby Normalization

```typescript
// Raw hobbies from onboarding → Normalized tags
'Tecnología' → 'tech'
'Música' → 'musica'
'Deporte' → 'deportes'
'Arte' → 'arte'
'Lectura' → 'lectura'
'Cocina' → 'cocina'
'Viajes' → 'viajes'
'Naturaleza' → 'naturaleza'
'Manualidades' → 'manualidades'
'Social/Amigos' → 'social'
```

### Goal Mapping

Goals from all three onboarding questions are combined:

```typescript
'Familia' → 'familia'
'Amigos' → 'amigos'
'Bienes/Casa' → 'bienes'
'Carrera/Trabajo' → 'carrera'
'Salud/Ejercicio' → 'salud'
'Personal/Aprendizaje' → 'crecimiento_personal'
'Estabilidad' → 'estabilidad'
```

---

## 8. Situation Classification

### The 4 Situations

#### 1. 💔 Rompimiento de Pareja (Breakup - "Tusa")

**Detection Keywords:**
```
rompí, tusa, despecho, ex, dejó, dejé, corazón roto, infiel, 
infidelidad, engañó, separación, divorcio, relación, pareja, 
novio, novia, amor, la tusa, despechado
```

**Beneficial Activities:**
- Actividades sociales (social)
- Deportes (sports)
- Viajes (travel)
- Eventos con amigos (social events)
- Música (music)

**To Avoid:**
- Actividades románticas
- Relacionadas con parejas
- Citas

**Reasoning:**
Movement + social connection heal breakup pain. Shifting focus from relationship to friends and activities helps recovery.

#### 2. 🕊️ Muerte Familiar (Family Loss)

**Detection Keywords:**
```
murió, falleció, partió, muerte, duelo, perdí, pérdida, padre, 
madre, abuelo, abuela, hermano, hermana, hijo, hija, funeral, 
luto, extraño mucho, ya no está, se fue
```

**Beneficial Activities:**
- Tranquilo (calm)
- Introspectivo (reflective)
- Naturaleza (nature)
- Mindfulness
- Expresivo/Arte (expressive art)
- Música (music)
- Deportes suave (gentle exercise)

**To Avoid:**
- Competitivo
- Fiesta/Celebración
- Alta estimulación

**Special Recommendation:**
Music like Alter Bridge or similar can help process grief.

#### 3. 💰 Causa Económica/Laboral (Economic Stress)

**Detection Keywords:**
```
dinero, plata, deudas, despido, despidieron, sin trabajo, 
desempleo, no me alcanza, crisis económica, quiebra, 
bancarrota, salario, sueldo, laboral, jefe, oficina, empresa, 
negocio, freelance, emprendimiento, navidad, diciembre, gastos,
no tengo pesos, no hay plata, quincena, colombia, colombiano
```

**Beneficial Activities:**
- Carrera/Empleo
- Tecnología
- Crecimiento personal
- Oportunidades económicas
- Educación/Capacitación

**To Avoid:**
- Lujo
- Exclusivo
- Costoso

**Special Cases:**
- **Navidad/Diciembre en Colombia:** December spending pressure
- **Despido:** Job loss - recommend retraining

#### 4. 🔒 Bloqueo/Incapacidad (Feeling Incapable)

**Detection Keywords:**
```
incapaz, no puedo, no sirvo, inútil, incompetente, perdido, 
caso perdido, fracasado, impostor, síndrome impostor, no entiendo, 
no aprendo, torpe, no sé nada, tecnología, no rindo, bloqueado, 
estancado, sin futuro, acabado, vida acabada, no valgo,
freddy vega, platzi, aprender, curso, no entiendo nada
```

**Beneficial Activities:**
- Crecimiento personal
- Tecnología
- Carrera/Empleo
- Salud
- Social/Mentorship
- Arte
- Educación
- Mentoría

**To Avoid:**
- Competitivo
- Alta presión

**Special Recommendations:**
- Freddy Vega courses
- Platzi bootcamps
- Mentoring programs
- Small-win learning paths

### Confidence Score

Classification includes a confidence score (0.0 - 1.0):
- Keywords matched × 3 = score (capped at 1.0)
- Helps track quality of classification
- Can be used for validation

---

## 9. Compensar Product Requirements

### Mandatory Fields

```typescript
interface Product {
  id: string;
  nombre: string;              // Product name
  descripcion: string;         // Description
  precio_desde: number;        // Starting price (COP)
  categoria_principal: string; // Main category
  subcategoria: string;        // Subcategory
  url: string;                 // Link to product
}
```

### Required Tags

#### situation_tags (MUST include at least one)
```typescript
type SituationTag = 
  | 'muerte_familiar'
  | 'causa_economica'
  | 'bloqueo_incapacidad'
  | 'rompimiento_pareja';

// Example:
"situation_tags": ["rompimiento_pareja", "causa_economica"]
```

#### profile_tags (RECOMMENDED - improves scoring)
```typescript
// Age categories
"joven" | "adulto" | "mayor"

// Hobbies
"tech" | "musica" | "deportes" | "arte" | "lectura" | 
"cocina" | "viajes" | "naturaleza" | "manualidades" | "social"

// Goals
"familia" | "amigos" | "bienes" | "carrera" | "salud" | 
"crecimiento_personal" | "estabilidad"

// Activity types
"educacion" | "mentoria" | "consulta" | "evento"

// Example:
"profile_tags": ["joven", "deportes", "social", "amigos"]
```

### Example Products

**Basketball Team Building**
```json
{
  "nombre": "Paquete de Basketball - Team Building",
  "descripcion": "Actividad de equipo que promueve amistad y ejercicio",
  "precio_desde": 10,
  "categoria_principal": "Deportes",
  "subcategoria": "Team Sports",
  "url": "https://...",
  "situation_tags": ["rompimiento_pareja", "bloqueo_incapacidad"],
  "profile_tags": ["joven", "deportes", "social", "amigos"]
}
```

**Freddy Vega Bootcamp**
```json
{
  "nombre": "Bootcamp Freddy Vega - Fundamentos de Programación",
  "descripcion": "Curso introductorio de programación con Freddy Vega",
  "precio_desde": 0,
  "categoria_principal": "Educación",
  "subcategoria": "Tecnología",
  "url": "https://...",
  "situation_tags": ["bloqueo_incapacidad", "causa_economica"],
  "profile_tags": ["joven", "adulto", "tech", "educacion", "crecimiento_personal"]
}
```

**Alter Bridge Concert/Streaming**
```json
{
  "nombre": "Concierto Alter Bridge - Streaming Access",
  "descripcion": "Música reconfortante para procesar emociones",
  "precio_desde": 5,
  "categoria_principal": "Entretenimiento",
  "subcategoria": "Música",
  "url": "https://...",
  "situation_tags": ["muerte_familiar", "rompimiento_pareja"],
  "profile_tags": ["joven", "adulto", "mayor", "musica", "tranquilo", "arte"]
}
```

**Asesoría Financiera Navidad**
```json
{
  "nombre": "Sesión de Asesoría Financiera - Plan Navidad",
  "descripcion": "Ayuda para manejar gastos de diciembre",
  "precio_desde": 0,
  "categoria_principal": "Consultoría",
  "subcategoria": "Finanzas Personales",
  "url": "https://...",
  "situation_tags": ["causa_economica"],
  "profile_tags": ["joven", "adulto", "mayor", "educacion", "bienes", "crecimiento_personal"],
  "keywords": ["navidad", "colombia", "diciembre", "gastos"]
}
```

---

## 10. Admin Dashboard

### Access
- URL: `/admin/dashboard`
- Requires: `role: 'admin'` in user metadata

### Features

#### Budget Overview Card
- Total budget for period
- Amount allocated to approvals
- Remaining available budget
- Visual progress bar (green/yellow/red)

#### Filter Buttons
- **Pendientes** - Waiting for HR decision
- **Aprobadas** - Approved by HR
- **Rechazadas** - Rejected by HR
- **Todas** - All requests

#### Request Cards (Individual)

Each request card shows:

**Header:**
- Situation type with emoji (💔🕊️💰🔒)
- Status badge (pending/approved/rejected)
- Product price in COP

**Profile Section:**
- Age (anonymous, just the range)
- Gender
- Hobbies list
- Goals list

**Empathic Message:**
- The personalized message shown to employee
- Provides context for HR decision

**Recommendation Details:**
- Reasons why this product was recommended
- Score and keyword matches
- Product category/subcategory

**Actions:**
- Approve button (green) - if budget available
- Reject button (red) - always available
- Optional reason input for rejection

**Metadata:**
- Created timestamp
- Decision timestamp (if approved/rejected)
- Anonymous employee token (for linking to notifications)

### Decision Flow

**Approval:**
1. HR clicks "Aprobar"
2. System checks: Is budget available?
   - Yes → Approve, deduct budget, create notification
   - No → Show warning, prevent approval
3. Budget automatically updated by trigger
4. Employee receives anonymous notification

**Rejection:**
1. HR enters reason (optional)
2. HR clicks "Rechazar"
3. Status updated to "rejected"
4. System records reason
5. No budget deducted

---

## 11. Integration Guide

### Option 1: Automatic Detection in Chat (Recommended)

```typescript
// In your chat interface component

import { useRecommendation } from '@/hooks/use-recommendation';
import { RecommendationCard } from '@/components/chat/recommendation-card';

export function ChatInterface({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Get user profile from onboarding
  const [profile, setProfile] = useState<Profile | null>(null);
  
  useEffect(() => {
    const loadProfile = async () => {
      const p = await getProfileFromOnboarding(userId);
      setProfile(p);
    };
    loadProfile();
  }, [userId]);

  // Recommendation hook
  const {
    getRecommendation,
    shouldTriggerRecommendation,
    lastRecommendation,
    loading
  } = useRecommendation({ profile: profile! });

  // Handle incoming message
  const handleMessage = async (newMessage: string) => {
    setMessages([...messages, { role: 'user', content: newMessage }]);

    // Check if message contains distress keywords
    if (shouldTriggerRecommendation(newMessage)) {
      // Get full conversation as transcript
      const transcript = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n') + `\nuser: ${newMessage}`;

      // Generate anonymous token
      const anonymousToken = `anon_${userId}_${Date.now()}`;

      // Get recommendation (saves to DB)
      await getRecommendation(transcript, anonymousToken);
    }
  };

  return (
    <div>
      {/* Messages */}
      {messages.map((msg, i) => (
        <div key={i} className={msg.role}>
          {msg.content}
        </div>
      ))}

      {/* Show recommendation if detected */}
      {lastRecommendation && !loading && (
        <RecommendationCard result={lastRecommendation} />
      )}

      {/* Input field */}
      <input
        placeholder="Escribe tu mensaje..."
        onSubmit={(e) => handleMessage(e.target.value)}
      />
    </div>
  );
}
```

### Option 2: Manual API Call

```typescript
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcript: fullChatHistory,
    profile: {
      userId: 'user-123',
      name: 'Carlos',
      age: 19,
      ageCategory: 'joven',
      gender: 'masculino',
      hobbies: ['deportes', 'musica'],
      goals: ['amigos', 'salud', 'crecimiento_personal']
    },
    anonymousToken: 'anon_user_123_timestamp'
  })
});

const { data: result } = await response.json();

console.log('Situation:', result.situation.type);
console.log('Recommendation:', result.recommendations[0].product.nombre);
console.log('Message:', result.empathicMessage);
```

### Option 3: Direct Function Call

```typescript
import { getProfileFromOnboarding } from '@/Typescript-Integration/profile-adapter';
import { classifySituation, getRecommendations } from '@/Typescript-Integration/recommender';

async function processUserSituation(userId: string, transcript: string) {
  // 1. Get profile from onboarding
  const profile = await getProfileFromOnboarding(userId);
  if (!profile) return console.error('No onboarding found');

  // 2. Classify situation
  const situation = classifySituation(transcript);

  // 3. Get recommendations (saves to DB)
  const result = await getRecommendations(
    profile,
    situation,
    transcript,
    4,                          // Top N
    `anon_${userId}_${Date.now()}`,
    true                        // Save to database
  );

  return result;
}
```

---

## 12. Testing & Examples

### Test Cases

Run built-in tests:

```bash
npx ts-node Typescript-Integration/examples.ts
```

### Test Case 1: Muerte Familiar

```typescript
{
  user: 'Carlos, 18-25, likes sports, wants sports career',
  situation: 'My grandfather died...',
  expected: 'Calm activities + Alter Bridge + gentle exercise'
}
```

### Test Case 2: Navidad sin Dinero

```typescript
{
  user: 'María, 26-35, Colombian',
  situation: 'It\'s Christmas and I have no money...',
  expected: 'Financial advice + economic opportunities'
}
```

### Test Case 3: Bloqueo Tech

```typescript
{
  user: 'Juan, 18-25, wants to learn programming',
  situation: 'I don\'t understand anything about technology...',
  expected: 'Freddy Vega course + basic mentoring'
}
```

### Test Case 4: La Tusa

```typescript
{
  user: 'Andrea, 18-25, likes parties/friends',
  situation: 'I broke up with my boyfriend, I\'m in "tusa"...',
  expected: 'Social activities + low-cost options + music'
}
```

### Running Tests

```bash
npm run test:wellness
```

Or manually:

```bash
npx ts-node Typescript-Integration/test-wellness-system.ts
```

### Test Script Output

```
✅ Profile: {
  name: 'Carlos',
  age: 19,
  ageCategory: 'joven',
  hobbies: ['deportes', 'musica'],
  goals: ['amigos', 'salud']
}

✅ Situation: { type: 'rompimiento_pareja', confidence: 0.9 }

✅ Top Recommendation:
   Basketball Team Building
   Price: $10
   Score: 85
   Reasons: Team sport, builds friendships, matches sports hobby

💬 Empathic Message:
   "Andrea, I know today you have to get over a breakup..."
```

---

## 13. Security Model

### Authentication

- **Chat/Recommendations:** Requires authenticated user (via onboarding)
- **Admin Dashboard:** Requires `role: 'admin'` in user metadata

### Authorization (Row Level Security)

#### wellness_requests Table
```
✓ SELECT (Admin only)
✓ INSERT (Service role only, for system recommendations)
✓ UPDATE (Admin only, for approve/reject)
✗ Everyone else: Blocked
```

#### admin_budget Table
```
✓ SELECT/INSERT/UPDATE/DELETE (Admin only)
✗ Everyone else: Blocked
```

#### employee_notifications Table
```
✓ SELECT (Anyone, but filtered by anonymous_token in app code)
✓ INSERT (Service role only)
✓ UPDATE (User updates their own notifications)
```

### Privacy

**Anonymous Tokens:**
```typescript
// Instead of user IDs
// Use: anon_{userId}_{timestamp}_{random}

// Example:
anon_user123_1701945600000_abc7f3
```

**No Sensitive Data:**
- No names in wellness_requests
- No email addresses
- No user IDs (only anonymous tokens)
- Age shown as category (joven/adulto/mayor), not exact age
- Hobbies and goals as lists (no narrative about person)

---

## 14. Troubleshooting

### ❌ Recommendations Not Generating

**Check 1: Situation Classification**
```bash
# Enable console logging
const situation = classifySituation(transcript);
console.log('Detected situation:', situation);
```

**Check 2: Compensar Database**
- Does your Compensar-Database table have products?
- Do products have `situation_tags`?
- Do products have `profile_tags`?

**Check 3: User Profile**
- Does onboarding exist for this user?
- Does onboarding have hobbies and goals?

**Check 4: Console Errors**
- Check browser DevTools → Console
- Check server logs

### ❌ No Matches Found

**Solution 1: Add More Products**
- Products missing in Compensar-Database
- Or products missing situation_tags

**Solution 2: Update Tags**
```sql
UPDATE "Compensar-Database"
SET situation_tags = array_append(situation_tags, 'rompimiento_pareja')
WHERE nombre LIKE '%basketball%';
```

**Solution 3: Expand Keywords**
- Add more keywords to SITUATION_CONFIG in recommender.ts

### ❌ Budget Not Updating

**Check 1: Trigger Installed**
```sql
-- Verify trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_budget_on_approval';
```

**Check 2: Budget Period**
- Is current date between period_start and period_end?

**Check 3: RLS Policies**
- Can service role update admin_budget?

**Solution:**
```sql
-- Re-create trigger
DROP TRIGGER IF EXISTS trigger_update_budget_on_approval ON wellness_requests;
-- Then run trigger creation SQL from schema section
```

### ❌ Admin Dashboard Empty

**Check 1: User Role**
```sql
-- Verify user has admin role
SELECT raw_user_meta_data FROM auth.users 
WHERE email = 'admin@company.com';

-- Should show: { "role": "admin" }
```

**Update role if needed:**
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"')
WHERE email = 'admin@company.com';
```

**Check 2: RLS Policies**
- Verify admin policy exists and is correct

**Check 3: Supabase Connection**
- Check `.env.local` has correct URL and key
- Test connection in browser DevTools

### ❌ Notifications Not Appearing

**Check 1: Notification Creation**
- Was request actually approved?
- Check employee_notifications table has entry

**Check 2: Anonymous Token Match**
- Frontend anonymous_token must match stored token
- Check exact match in database

**Check 3: RLS for Notifications**
- Anonymous tokens allow notification visibility

---

## 15. Future Enhancements

### Phase 2

- [ ] **Email Notifications** - Send to company email when approved
- [ ] **SMS Notifications** - WhatsApp/SMS alerts
- [ ] **Feedback Loop** - Employee feedback on recommendation quality
- [ ] **Analytics Dashboard** - Track most-recommended activities, success rates

### Phase 3

- [ ] **Budget Forecasting** - Predict next month's needs
- [ ] **A/B Testing** - Test different messaging approaches
- [ ] **Machine Learning** - Improve recommendation scoring with feedback
- [ ] **Multi-language** - Spanish/English support
- [ ] **Integration with HR Systems** - Sync with Workday, BambooHR, etc.

### Phase 4

- [ ] **Wellness Outcomes Tracking** - Measure productivity impact
- [ ] **Peer Recommendations** - Employees recommend to each other
- [ ] **Wellness Programs** - Curated bundles/tracks
- [ ] **Manager Insights** - Reports for team leads

---

## 16. Setup Checklist

### Pre-Deployment

- [ ] **Environment Variables**
  - [ ] `.env.local` created with Supabase URL/Keys
  - [ ] Test connection to Supabase

- [ ] **Database Setup**
  - [ ] Run SQL schema for all 3 tables
  - [ ] Create trigger for budget updates
  - [ ] Initialize admin_budget with period and amount
  - [ ] Verify tables exist and are accessible

- [ ] **Product Database**
  - [ ] Populate Compensar-Database with products
  - [ ] Verify all products have `situation_tags`
  - [ ] Add `profile_tags` where applicable
  - [ ] Test product queries

- [ ] **Admin User**
  - [ ] Create admin user in Supabase auth
  - [ ] Set `role: 'admin'` in user metadata
  - [ ] Test admin dashboard access

### Testing

- [ ] **Unit Tests**
  - [ ] Run `npm run test:wellness`
  - [ ] All test cases pass
  - [ ] Verify database saves work

- [ ] **Integration Tests**
  - [ ] Test recommendation end-to-end
  - [ ] Test approval and budget deduction
  - [ ] Test notifications appear

- [ ] **Manual Testing**
  - [ ] Chat → Detects situation → Shows recommendation
  - [ ] Dashboard → Shows pending requests
  - [ ] Approve → Budget updates immediately
  - [ ] Employee receives notification

### Deployment

- [ ] Backup production database
- [ ] Run SQL schema in production
- [ ] Deploy code to production
- [ ] Test in production environment
- [ ] Monitor for errors

### Post-Deployment

- [ ] Train HR admins on dashboard
- [ ] Communicate to employees about wellness system
- [ ] Monitor first week of activity
- [ ] Gather feedback and iterate

---

## 📞 Support & Questions

For issues or questions:
1. Check Troubleshooting section (§14)
2. Review Integration Guide (§11)
3. Check example use cases (§12)
4. Review database schema (§4)

---

## 📜 License

Same as BeHuman project.

---

**Last Updated:** December 7, 2025  
**Version:** 1.0  
**Status:** Production Ready

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