# Wellness Recommendation System - Database Setup Guide

This guide explains the database schema for the wellness recommendation and approval system.

## Overview

The system workflow:
1. Employee chats with BeHuman about their situation (e.g., breakup, family death, economic stress)
2. System classifies the situation and recommends wellness activities from Compensar database
3. Recommendation request is saved with anonymous employee token
4. HR admin sees pending requests in dashboard with budget information
5. HR approves/rejects recommendations within budget constraints
6. Employee receives anonymous notification about approved wellness activity

## Database Schema

### Table 1: wellness_requests

Stores each wellness recommendation request from employees.

```sql
-- Create the wellness_requests table
CREATE TABLE public.wellness_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Anonymous employee identifier (no direct user_id for privacy)
  anonymous_token VARCHAR(255) NOT NULL,
  
  -- Situation classification
  situation_type VARCHAR(100) NOT NULL, -- e.g., 'rompimiento_pareja', 'muerte_familiar'
  situation_subtype VARCHAR(100),
  situation_context TEXT,
  situation_confidence DECIMAL(3,2),
  
  -- User profile snapshot (for recommendation context)
  profile_snapshot JSONB NOT NULL,
  
  -- Chat transcript excerpt (for HR context)
  transcript_excerpt TEXT,
  
  -- Top recommended product
  recommended_product_id VARCHAR(100) NOT NULL,
  recommended_product_name VARCHAR(255) NOT NULL,
  recommended_product_price DECIMAL(10,2) NOT NULL,
  recommended_product_category VARCHAR(100),
  recommended_product_subcategory VARCHAR(100),
  
  -- Full product snapshot
  product_snapshot JSONB NOT NULL,
  
  -- Recommendation reasoning
  recommendation_score INTEGER NOT NULL,
  recommendation_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Empathic message
  empathic_message TEXT,
  
  -- Estimated productivity impact
  estimated_productivity_uplift_percent INTEGER DEFAULT 15,
  
  -- Request status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  
  -- HR decision
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Budget tracking
  budget_allocated DECIMAL(10,2),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_wellness_requests_status ON public.wellness_requests(status);
CREATE INDEX idx_wellness_requests_created_at ON public.wellness_requests(created_at DESC);
CREATE INDEX idx_wellness_requests_anonymous_token ON public.wellness_requests(anonymous_token);

-- Enable Row Level Security
ALTER TABLE public.wellness_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admins can view wellness requests
CREATE POLICY "Admins can view wellness requests"
  ON public.wellness_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: System can insert wellness requests (via service role)
CREATE POLICY "Service role can insert wellness requests"
  ON public.wellness_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can update wellness requests
CREATE POLICY "Admins can update wellness requests"
  ON public.wellness_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### Table 2: admin_budget

Tracks the wellness budget allocated and spent.

```sql
-- Create the admin_budget table
CREATE TABLE public.admin_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Period tracking (e.g., monthly, quarterly)
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Budget amounts
  total_budget DECIMAL(10,2) NOT NULL,
  allocated_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  spent_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one budget per period
  CONSTRAINT unique_budget_period UNIQUE(period_start, period_end)
);

-- Create index
CREATE INDEX idx_admin_budget_period ON public.admin_budget(period_start, period_end);

-- Enable Row Level Security
ALTER TABLE public.admin_budget ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view budget
CREATE POLICY "Admins can view budget"
  ON public.admin_budget
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can manage budget
CREATE POLICY "Admins can manage budget"
  ON public.admin_budget
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### Table 3: employee_notifications

Stores anonymous notifications sent to employees after approval.

```sql
-- Create the employee_notifications table
CREATE TABLE public.employee_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links to wellness request
  wellness_request_id UUID NOT NULL REFERENCES public.wellness_requests(id) ON DELETE CASCADE,
  
  -- Anonymous employee identifier
  anonymous_token VARCHAR(255) NOT NULL,
  
  -- Notification content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Product/intervention details
  intervention_details JSONB NOT NULL,
  
  -- Delivery status
  delivered BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_employee_notifications_token ON public.employee_notifications(anonymous_token);
CREATE INDEX idx_employee_notifications_delivered ON public.employee_notifications(delivered);
CREATE INDEX idx_employee_notifications_created_at ON public.employee_notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.employee_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can view their own notifications (by anonymous token stored in session)
CREATE POLICY "Employees can view their notifications"
  ON public.employee_notifications
  FOR SELECT
  USING (true); -- Will be filtered by anonymous_token in application code

-- Policy: System can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON public.employee_notifications
  FOR INSERT
  WITH CHECK (true);

-- Policy: Employees can mark notifications as read
CREATE POLICY "Employees can update their notifications"
  ON public.employee_notifications
  FOR UPDATE
  USING (true); -- Will be filtered by anonymous_token in application code
```

## Trigger: Update Budget on Approval

```sql
-- Function to update budget when request is approved
CREATE OR REPLACE FUNCTION update_budget_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Update current period budget
    UPDATE public.admin_budget
    SET 
      allocated_budget = allocated_budget + NEW.recommended_product_price,
      spent_budget = spent_budget + NEW.recommended_product_price,
      updated_at = NOW()
    WHERE 
      period_start <= CURRENT_DATE 
      AND period_end >= CURRENT_DATE;
    
    -- Store allocated amount in request
    NEW.budget_allocated = NEW.recommended_product_price;
    NEW.reviewed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_budget_on_approval
  BEFORE UPDATE ON public.wellness_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_on_approval();
```

## Sample Data Insertion

```sql
-- Insert initial budget for current period
INSERT INTO public.admin_budget (period_start, period_end, total_budget)
VALUES (
  DATE_TRUNC('month', CURRENT_DATE),
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE,
  400.00
);
```

## Usage Examples

### Create a wellness request (from chat system)

```typescript
import { getSupabaseClient } from './Typescript-Integration/supabaseClient';

async function createWellnessRequest(
  anonymousToken: string,
  situation: Situation,
  profile: Profile,
  topRecommendation: ScoredProduct,
  empathicMessage: string,
  transcriptExcerpt: string
) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('wellness_requests')
    .insert([{
      anonymous_token: anonymousToken,
      situation_type: situation.type,
      situation_subtype: situation.subtype,
      situation_context: situation.context,
      situation_confidence: situation.confidence,
      profile_snapshot: profile,
      transcript_excerpt: transcriptExcerpt,
      recommended_product_id: topRecommendation.product.id,
      recommended_product_name: topRecommendation.product.nombre,
      recommended_product_price: topRecommendation.product.precio_desde,
      recommended_product_category: topRecommendation.product.categoria_principal,
      recommended_product_subcategory: topRecommendation.product.subcategoria,
      product_snapshot: topRecommendation.product,
      recommendation_score: topRecommendation.score,
      recommendation_reasons: topRecommendation.reasons,
      empathic_message: empathicMessage,
      status: 'pending'
    }])
    .select()
    .single();
    
  return { data, error };
}
```

### Get pending requests for admin dashboard

```typescript
async function getPendingWellnessRequests() {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('wellness_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
    
  return { data, error };
}
```

### Approve a request

```typescript
async function approveWellnessRequest(requestId: string, adminUserId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('wellness_requests')
    .update({
      status: 'approved',
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single();
    
  // Create notification for employee
  if (data) {
    await supabase
      .from('employee_notifications')
      .insert([{
        wellness_request_id: data.id,
        anonymous_token: data.anonymous_token,
        title: '¡Buenas noticias!',
        message: `Tu empresa ha aprobado: ${data.recommended_product_name}`,
        intervention_details: data.product_snapshot
      }]);
  }
    
  return { data, error };
}
```

### Get current budget status

```typescript
async function getCurrentBudgetStatus() {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('admin_budget')
    .select('*')
    .lte('period_start', new Date().toISOString())
    .gte('period_end', new Date().toISOString())
    .single();
    
  return { data, error };
}
```

## Next Steps

1. Run the SQL schema in Supabase SQL Editor
2. Update TypeScript types to include new tables
3. Create API routes for wellness requests
4. Build admin dashboard UI
5. Integrate with chat system
